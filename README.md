# Banco Cloud — Frontend

SPA de Banco Cloud, una aplicación de fondos mutuos. Construida con React 19, TypeScript y Vite; la autenticación usa AWS Cognito mediante AWS Amplify.

Backend: [Cloud-Native-Backend](https://github.com/itzAragorn/Cloud-Native-Backend)

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
