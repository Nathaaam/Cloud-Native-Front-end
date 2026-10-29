#!/usr/bin/env bash
# Banco Cloud - publica el frontend en S3 detrás de CloudFront.
#
# Configuración: .env.production.local (ver .env.production.example). Vite lo
# carga en el build y el script toma de ahí S3_BUCKET y CLOUDFRONT_DISTRIBUTION_ID.
# Requiere credenciales de AWS vigentes (aws configure o variables AWS_*).
#
# Uso:
#   ./scripts/deploy-s3.sh               build + subida + invalidación de CloudFront
#   ./scripts/deploy-s3.sh --solo-build  build y verificación, sin subir nada

set -euo pipefail

FRONT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$FRONT_DIR/.env.production.local"
SOLO_BUILD=false
[[ ${1:-} == --solo-build ]] && SOLO_BUILD=true

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m ✔\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m ✘\033[0m %s\n' "$*" >&2; exit 1; }

[[ -f $ENV_FILE ]] || fail "Falta $ENV_FILE (copia .env.production.example)"
set -a; . "$ENV_FILE"; set +a

# ---------------------------------------------------------------- validación
[[ ${VITE_API_URL:-} == https://* ]] || fail "VITE_API_URL debe ser la URL https de API Gateway"
[[ $VITE_API_URL == */api/v1 ]]       || fail "VITE_API_URL debe terminar en /api/v1"
[[ $VITE_API_URL != *xxxxxxxxxx* ]]   || fail "VITE_API_URL todavía tiene el valor de ejemplo"
for var in VITE_COGNITO_USER_POOL_ID VITE_COGNITO_USER_POOL_CLIENT_ID VITE_AWS_REGION; do
  value=${!var:-}
  if [[ -z $value || $value == *XXXXXXXXX* || $value == *your_* ]]; then
    fail "$var no está configurada"
  fi
done
if ! $SOLO_BUILD; then
  [[ -n ${S3_BUCKET:-} ]] || fail "S3_BUCKET no está configurada"
  aws sts get-caller-identity >/dev/null 2>&1 \
    || fail "Credenciales de AWS ausentes o vencidas (en el Learner Lab cópialas de 'AWS Details')"
fi
ok "Configuración válida (API $VITE_API_URL)"

# ---------------------------------------------------------------- build
info "Build de producción"
cd "$FRONT_DIR"
npm ci --no-audit --no-fund
npm run build

# Las VITE_* quedan fijas en el bundle: comprobar que lleva la API y el pool correctos
grep -rqF "$VITE_API_URL" dist/assets || fail "El bundle no contiene $VITE_API_URL"
grep -rqF "$VITE_COGNITO_USER_POOL_ID" dist/assets || fail "El bundle no contiene el User Pool $VITE_COGNITO_USER_POOL_ID"
if grep -rqF "localhost:8090" dist/assets; then
  fail "El bundle todavía apunta a localhost:8090"
fi
ok "Bundle verificado: $(du -sh dist | cut -f1)"

if $SOLO_BUILD; then
  ok "--solo-build: no se subió nada"
  exit 0
fi

# ---------------------------------------------------------------- subida
# Los assets llevan hash en el nombre: caché larga. index.html siempre se revalida.
info "Subiendo a s3://$S3_BUCKET"
aws s3 sync dist/ "s3://$S3_BUCKET/" --delete --exclude index.html \
  --cache-control "public,max-age=31536000,immutable"
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --cache-control "no-cache" --content-type "text/html; charset=utf-8"
ok "Archivos subidos"

if [[ -n ${CLOUDFRONT_DISTRIBUTION_ID:-} ]]; then
  info "Invalidando CloudFront $CLOUDFRONT_DISTRIBUTION_ID"
  aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/index.html" "/" --query 'Invalidation.Id' --output text
  dominio=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' --output text)
  ok "Frontend publicado en https://$dominio"
else
  ok "Sin CLOUDFRONT_DISTRIBUTION_ID: no se invalidó la caché"
fi
