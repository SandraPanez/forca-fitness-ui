# Forca & Fitness

Sistema de gestión para una cadena de gimnasios de artes marciales.

## Arquitectura

El backend se organiza como un monolito modular siguiendo MVC:

1. **Vistas:** páginas HTML en `frontend/`; consumen la API HTTP.
2. **Rutas:** `backend/src/routes/` asigna cada URL al controlador de su módulo.
3. **Controladores:** `backend/src/controllers/` procesa solicitudes y respuestas.
4. **Modelos:** `backend/src/models/` contiene las consultas y reglas actuales de cada dominio.
5. **Persistencia:** PostgreSQL, configurado en `backend/config/db.js`.

`backend/src/app.js` compone middleware y rutas; `backend/server.js` inicia el servidor. Las rutas de dominio existentes se conservan bajo `/api`: alumnos, disciplinas, matrículas, pagos, accesos y autenticación.

El manejo de rutas inexistentes y errores HTTP está centralizado en `backend/src/middleware/`. Las integraciones externas y los módulos aún no implementados deben añadirse como componentes del backend, no como microservicios prematuros.

## Estructura del proyecto

```text
backend/
  config/                 Configuración de PostgreSQL
  src/
    controllers/           Controladores MVC
    middleware/            Middleware de Express
    models/                 Modelos y consultas
    routes/                 Rutas por dominio y registro central
  server.js                Arranque del servidor
database/
  schema.sql               Tablas e índices
  migrations/              Cambios incrementales para bases existentes
  seed.sql                 Datos opcionales de demostración
frontend/
  index.html               Entrada que redirige al inicio de sesión
  pages/
    auth.js                Navegación compartida y guardias de roles
    auth/                  Inicio de sesión
    admin/                 Dashboard, alumnos, accesos y tesorería
    portal/                Clases, matrículas, perfil y pagos
```

El frontend sigue siendo multipágina con estilos y scripts locales; se agrupa por área para facilitar su mantenimiento. Cada página conserva enlaces relativos hacia las otras áreas.

## Puesta en marcha

1. Crear una base de datos PostgreSQL vacía.
2. Aplicar `database/schema.sql` para crear las tablas e índices.
   En una base existente, revisar los datos y aplicar en orden las migraciones de `database/migrations/`.
3. Opcionalmente, aplicar `database/seed.sql` para cargar datos de demostración.
4. Copiar `backend/.env.example` a `backend/.env` y configurar `DATABASE_URL` con las credenciales de una base local o de pruebas. Generar `JWT_SECRET` con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y configurarlo en el entorno privado del backend; no reutilizarlo entre entornos.
5. Instalar dependencias desde `backend/` con `npm install`.
6. Iniciar el API con `npm start` o `npm run dev`.

El API usa el puerto `3000` por defecto y permite configurar otro mediante `PORT`.

`database/schema.sql` crea únicamente estructura; no elimina tablas existentes. `database/seed.sql` solo carga datos de dominio para desarrollo y no crea cuentas de acceso. Las cuentas deben tener un hash bcrypt en `usuarios.password_hash`; nunca guardes contraseñas en texto plano.

`backend/.env` está excluido de Git. No guardes credenciales reales en archivos versionados ni ejecutes migraciones o datos de prueba contra la base de producción.

Para abrir las vistas, sirve `frontend/` con la extensión Live Server de VS Code y entra a `index.html`; redirige a `pages/auth/login.html`. Las páginas todavía apuntan a la URL de producción del API; para probar el frontend contra un backend local habría que cambiar esa configuración.

## Estado

Las matrículas activas respetan el aforo de cada disciplina. La creación y reactivación de una matrícula bloquea la disciplina durante la comprobación; si no hay cupos, la API responde `409`. Reducir el aforo por debajo de las matrículas activas también responde `409`.

El login compara hashes bcrypt y emite JWT de una hora. Todas las rutas de dominio requieren un token Bearer; `/api/auth/login` es pública, mientras que `/api/auth/me` y `/api/auth/logout` requieren token. Configura `JWT_SECRET` en el entorno de despliegue antes de habilitar el login. Cerrar sesión en el navegador elimina el token; al ser JWT stateless, un token ya emitido sigue siendo válido hasta expirar.

La navegación alinea los nombres del C4 con los roles técnicos (`Director`/`admin`, `Profesor`/`instructor`, `Recepcionista`/`recepcion`, `Tesorero`/`tesorero` y `Alumno`/`alumno`). Las guardias del frontend solo controlan la presentación y no reemplazan la autorización por rol en cada endpoint del backend.

Para una demostración, después de aplicar `schema.sql` y `seed.sql`, ejecuta `npm run create:demo-users` desde `backend/`. El script crea una cuenta por rol, genera contraseñas aleatorias y las muestra una sola vez en la terminal. Si `DATABASE_URL` apunta a una base remota, exige `ALLOW_REMOTE_DEMO_ACCOUNT_SEED=true`; úsalo únicamente si confirmaste que es la base vacía de demostración, nunca sobre datos reales. No guardes esas contraseñas en Git ni las compartas en capturas o chats.

La migración `002_secure_user_authentication.sql` se detiene si encuentra cuentas heredadas con contraseñas en texto plano; no la ejecutes directamente en una base con usuarios sin respaldo y un plan de restablecimiento. El POS de recepción y el pase de lista QR para profesores aún no tienen vistas ni endpoints propios; la autorización fina por rol en cada endpoint sigue pendiente.
