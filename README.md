# Banco Cloud — Frontend

SPA de Banco Cloud, una aplicación de fondos mutuos. Construida con React 19, TypeScript y Vite; la autenticación usa AWS Cognito mediante AWS Amplify.

Backend: [Cloud-Native-Backend](https://github.com/itzAragorn/Cloud-Native-Backend) · Aplicación desplegada: https://3cwdl02ue4.execute-api.us-east-1.amazonaws.com

## Pantallas

- **Ingreso y registro**: inicio de sesión con email, registro y confirmación por código (Cognito).
- **Dashboard**: resumen de inversiones y rendimiento.
- **Mi Portafolio**: inversiones con su número de comprobante (`BC-<año>-<correlativo>`). El comprobante se genera de forma asíncrona, así que una inversión recién creada puede mostrar "En proceso" unos segundos.
- **Nueva inversión**: fondos activos e inversión en un fondo.
- **Administración** (rol `ADMIN`):
  - *General*: fondos, valor cuota y autorización, bloqueo o desbloqueo de usuarios.
  - *Mensajería*: estado de las colas de RabbitMQ y sus DLQ, y creación o eliminación de colas, exchanges y bindings.

## Autenticación

1. El usuario se registra o inicia sesión en Cognito (solo se envía `email`; nombre y apellido se guardan en el backend).
2. La app obtiene el **Access Token** y lo envía al BFF en `Authorization: Bearer <token>`.
3. Al registrarse se crea el perfil local en `POST /usuarios/registro`; en cada ingreso se carga con `GET /usuarios/me`.
4. El rol y el estado del perfil local determinan qué puede hacer el usuario; el backend aplica la autorización.

El App Client de Cognito debe ser público (sin client secret), con el flujo `ALLOW_USER_SRP_AUTH` y `email` como único atributo obligatorio.

## Configuración

Copia `.env.example` a `.env.local` y completa los valores:

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL del BFF, por ejemplo `http://localhost:8090/api/v1` |
| `VITE_COGNITO_USER_POOL_ID` | User Pool ID de Cognito |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | App Client ID de Cognito |
| `VITE_AWS_REGION` | Región del User Pool |

Las variables `VITE_*` se incorporan al bundle durante el build; no pongas secretos en ellas.

## Ejecución

```bash
npm ci
npm run dev       # http://localhost:5173
npm run build     # bundle en dist/
npm run lint
```

En Docker, el `Dockerfile` construye el bundle con Node 20 y lo sirve con Nginx en el puerto 80. El `docker-compose.yml` del backend levanta el frontend junto con el resto del stack y le pasa las variables `VITE_*` desde su `.env`.

## Despliegue en AWS

Aplicación desplegada: **https://3cwdl02ue4.execute-api.us-east-1.amazonaws.com**

El build se publica en un bucket de S3 y lo sirve **API Gateway**, la misma HTTP API que expone el backend. Así el frontend y la API comparten URL y HTTPS. El Learner Lab no permite usar CloudFront.

| Ruta en API Gateway | Integración |
|---|---|
| `GET /` | HTTP → `https://<bucket>.s3.us-east-1.amazonaws.com/index.html` |
| `GET /favicon.svg` | HTTP → `https://<bucket>.s3.us-east-1.amazonaws.com/favicon.svg` |
| `GET /assets/{proxy+}` | HTTP → `https://<bucket>.s3.us-east-1.amazonaws.com/assets/{proxy}` |
| `ANY /{proxy+}` | VPC Link → ALB → BFF (`/api/v1/...`) |

La política del bucket permite lectura pública **solo** de `index.html`, `favicon.svg` y `assets/*`. Ningún otro objeto del bucket queda accesible. Si el build agrega un archivo nuevo en la raíz, hay que sumarlo a la política y crear su ruta.

### Publicar una versión nueva

```bash
cp .env.production.example .env.production.local   # URL de API Gateway, Cognito y bucket
./scripts/deploy-s3.sh                              # build, verificación y subida (requiere AWS CLI)
```

Sin credenciales de AWS CLI, `./scripts/deploy-s3.sh --solo-build` deja el build verificado en `dist/`. Después se sube desde la consola de S3:

- `index.html` y `favicon.svg`, a la raíz del bucket;
- la carpeta `assets`.

El script hace estas comprobaciones:

- Antes del build, exige que `VITE_API_URL` sea `https` y termine en `/api/v1`.
- Después del build, revisa que el bundle lleve esa URL y el User Pool, y que no quede ninguna referencia a `localhost`.
- En la subida, borra versiones viejas solo dentro de `assets/`. Nunca toca otros archivos del bucket.

En la subida, los assets llevan caché de un año porque tienen hash en el nombre, e `index.html` se revalida siempre.

La URL pública tiene que estar en `APP_CORS_ALLOWED_ORIGINS` del backend.
