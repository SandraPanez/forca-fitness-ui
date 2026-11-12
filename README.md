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
  seed.sql                 Datos opcionales de demostración
frontend/
  *.html                   Vistas multipágina con estilos y scripts locales
```

El frontend se mantiene multipágina y plano para conservar los enlaces relativos actuales; los recursos compartidos podrán extraerse cuando se incorpore un proceso de compilación o diseño común.

## Puesta en marcha

1. Crear una base de datos PostgreSQL vacía.
2. Aplicar `database/schema.sql` para crear las tablas e índices.
3. Opcionalmente, aplicar `database/seed.sql` para cargar datos de demostración.
4. Copiar `backend/.env.example` a `backend/.env` y completar `DATABASE_URL` y `JWT_SECRET`.
5. Instalar dependencias desde `backend/` con `npm install`.
6. Iniciar el API con `npm start` o `npm run dev`.

El API usa el puerto `3000` por defecto y permite configurar otro mediante `PORT`.

`database/schema.sql` crea únicamente estructura; no elimina tablas existentes. `database/seed.sql` es solo para bases locales/de prueba e inserta usuarios de demostración con contraseñas inseguras.

Para abrir las vistas, sirve `frontend/` con la extensión Live Server de VS Code y entra a `login.html`. Las páginas todavía apuntan a la URL de producción del API; para probar el frontend contra un backend local habría que cambiar esa configuración.

## Estado

Esta estructura establece la composición MVC y conserva las funcionalidades y endpoints existentes. La autenticación segura, autorización por roles, control transaccional de aforo, integraciones de pago/facturación, inventario, analítica y aplicaciones PWA/POS siguen siendo trabajo pendiente.
