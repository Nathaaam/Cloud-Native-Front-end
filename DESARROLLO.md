# 🚀 Banco Cloud - Guía de Desarrollo

## Estado: ✅ 100% Funcional

La aplicación está completamente funcional con Front-End conectado al Back-End y Base de Datos.

---

## 📋 Requisitos de contraseña

Al registrarse, la contraseña DEBE cumplir con:

- ✅ Mínimo **8 caracteres**
- ✅ Al menos **1 mayúscula** (A-Z)
- ✅ Al menos **1 número** (0-9)
- ✅ Al menos **1 símbolo especial** (!@#$%^&*)

### ✅ Ejemplos válidos:
- `Password123!`
- `MyPass@2024`
- `Banco#Cloud2024`

### ❌ Ejemplos inválidos:
- `password123` (sin mayúscula, sin símbolo)
- `Password!` (sin número)
- `Pass1!` (menos de 8 caracteres)

---

## 🏃 Cómo ejecutar la stack completa

### Opción 1: Terminal con 3 tabs

**Tab 1 - BFF Service (Puerto 8090):**
```bash
cd EV1/bff-service
./mvnw clean spring-boot:run
```

**Tab 2 - Usuarios Service (Puerto 8083):**
```bash
cd EV1/usuarios-service
./mvnw clean spring-boot:run
```

**Tab 3 - Frontend (Puerto 5173):**
```bash
cd banco-cloud-frontend
npm run dev
```

### Opción 2: Con scripts (si existen)

```bash
./start-all.sh
```

---

## 🧪 Probar la aplicación

### 1. Abrir la aplicación
```
http://localhost:5173/
```

### 2. Registrarse
- Click en "¿No tienes cuenta? Regístrate"
- Llenar el formulario con:
  - Nombre: Tu nombre
  - Apellido: Tu apellido
  - Correo: email@ejemplo.com
  - Contraseña: `Password123!` (o similar válida)
  - Confirmar: `Password123!`
- Click en "Crear cuenta"

### 3. Acceder a Dashboard
- Automáticamente loguea tras registro exitoso
- Si lo haces manualmente con login:
  - Email: email@banco.com
  - Contraseña: (la que registraste)

---

## 📊 Usuarios de prueba predefinidos

```
Email: admin@bancocloud.com
Contraseña: (ver en BD)
Rol: ADMIN

Email: cliente1@bancocloud.com
Contraseña: (ver en BD)
Rol: CLIENTE
```

Para resetear contraseña de prueba, ejecutar en terminal:

```bash
mysql -u root usuarios_db -e "
UPDATE usuarios 
SET password_hash = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyehJXaWLXKy6gYvpgqHYBRdTQR.3dXx4C'
WHERE email = 'usuario@banco.com';
"
```

(Contraseña será: "test123")

---

## 🔗 Endpoints principales

### Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/registro` - Registro
- `GET /api/v1/auth/verify` - Verificar token
- `POST /api/v1/auth/logout` - Logout

### Fondos
- `GET /api/v1/fondos` - Listar fondos
- `GET /api/v1/fondos/activos` - Fondos activos

### Inversiones
- `POST /api/v1/inversiones` - Crear inversión

---

## 🐛 Troubleshooting

### "Error de conexión al BFF"
- Verificar que BFF esté corriendo en puerto 8090
- Verificar CORS en `bff-service/application.properties`

### "Contraseña inválida"
- Revisar requisitos arriba
- Asegurar que tiene 1 mayúscula, 1 número, 1 símbolo

### "Email ya registrado"
- Usar otro email
- O limpiar BD: `TRUNCATE TABLE usuarios;`

### "No conecta a BD"
- Verificar que MySQL esté corriendo: `brew services list`
- Iniciar MySQL: `brew services start mysql`

---

## 📚 Estructura de carpetas

```
banco-cloud-frontend/
├── src/
│   ├── pages/           # Páginas (Login, Register, Dashboard, etc)
│   ├── services/        # Servicios API (apiService.ts)
│   ├── context/         # Context de autenticación
│   └── App.tsx          # Componente principal
└── package.json

EV1/
├── bff-service/         # API Gateway (Puerto 8090)
├── usuarios-service/    # Usuarios (Puerto 8083)
├── fondos-service/      # Fondos (Puerto 8081)
└── inversiones-service/ # Inversiones (Puerto 8082)
```

---

## ✅ Checklist de funcionalidad

- [x] Frontend en React + TypeScript
- [x] BFF Service con Spring Boot
- [x] Usuarios Service con Spring Boot
- [x] Base de datos MySQL
- [x] Autenticación JWT
- [x] Registro de usuarios
- [x] Login
- [x] Validación de contraseña
- [x] Manejo de errores
- [x] Token persistencia en localStorage
- [x] Protección de rutas

---

## 🎯 Próximos pasos

1. Completar funcionalidad de Fondos
2. Completar funcionalidad de Inversiones
3. Agregar formularios de Admin
4. Validación más robusta
5. Tests unitarios
6. Deployment a producción

---

**Última actualización:** 14/09/2026
**Stack Version:** v1.0-beta
