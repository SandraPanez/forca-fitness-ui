# 🥊 Forca & Fitness — Sistema de Gestión

> Proyecto Final — Arquitectura de Software · USMP Ciclo 7  
> Profesor: Ing. Fred Duarte

Sistema de gestión para cadena de gimnasios de artes marciales. Incluye frontend en HTML/CSS/JS y backend con Node.js + Express + PostgreSQL.

---

## 📁 Estructura del Proyecto

```
forca-fitness-ui/
├── frontend/           # Pantallas HTML (12 interfaces)
│   ├── login.html
│   ├── index.html
│   ├── alumnos.html
│   ├── mis-matriculas.html
│   ├── pagos.html
│   ├── comprobante.html
│   ├── control_acceso.html
│   ├── disciplinas.html
│   ├── renovar.html
│   ├── tesoreria.html
│   ├── perfil.html
│   └── editar-perfil.html
│
├── backend/            # API REST con Node.js + Express
│   ├── server.js
│   ├── package.json
│   ├── .env.example    # ← Copiar como .env y rellenar
│   ├── config/
│   │   └── db.js       # Conexión a PostgreSQL (Render)
│   └── src/
│       ├── routes/     # alumos, disciplinas, matriculas, pagos, accesos, auth
│       ├── controllers/
│       └── models/
│
├── database/
│   └── schema.sql      # Crear tablas + datos de prueba
│
└── README.md
```

---

## ⚡ Configuración Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/forca-fitness-ui.git
cd forca-fitness-ui
```

### 2. Crear la base de datos en Render
1. Ir a [render.com](https://render.com) → **New → PostgreSQL**
2. Nombre: `forca-fitness-db` → **Create Database**
3. Copiar el **External Database URL** (empieza con `postgres://...`)
4. En la pestaña **PSQL Command**, ejecutar `schema.sql`:
   - Copiar y pegar el contenido de `database/schema.sql` en la consola PSQL

### 3. Configurar variables de entorno
```bash
cd backend
cp .env.example .env
```
Editar `.env` con tus valores reales:
```
PORT=3000
DATABASE_URL=postgres://tu_url_de_render_aqui
JWT_SECRET=una_clave_secreta_larga
```
> ⚠️ **NUNCA subas el archivo `.env` a GitHub**

### 4. Instalar dependencias y correr el servidor
```bash
cd backend
npm install
npm run dev      # Desarrollo (con nodemon)
# npm start      # Producción
```

El servidor estará en: `http://localhost:3000`

---

## 🔗 Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/alumnos` | Listar alumnos (filtros: estado, disciplina, search) |
| GET | `/api/alumnos/:id` | Ver alumno por ID |
| POST | `/api/alumnos` | Crear alumno |
| PUT | `/api/alumnos/:id` | Actualizar alumno |
| DELETE | `/api/alumnos/:id` | Eliminar alumno |
| GET | `/api/disciplinas` | Listar disciplinas con cupos |
| GET | `/api/matriculas` | Listar matrículas |
| GET | `/api/matriculas/alumno/:id` | Matrículas de un alumno |
| GET | `/api/pagos` | Listar pagos (filtros: estado, medio) |
| GET | `/api/pagos/pendientes` | Solo pagos pendientes |
| PUT | `/api/pagos/:id/confirmar` | Confirmar pago |
| PUT | `/api/pagos/:id/rechazar` | Rechazar pago |
| GET | `/api/accesos` | Registro de accesos |
| POST | `/api/accesos/registrar` | Registrar ingreso/salida |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |

---

## 🌿 Ramas Git

| Rama | Contenido |
|------|-----------|
| `main` | Versión estable del proyecto |
| `dev` | Integración de nuevas funcionalidades |
| `feature/frontend-ui` | Pantallas HTML completas |
| `feature/backend-api` | API REST + modelos + rutas |
| `feature/db-schema` | Esquema PostgreSQL + migraciones |

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js v24, Express 4
- **Base de datos:** PostgreSQL (alojada en Render)
- **ORM/Driver:** pg (node-postgres)
- **Dev tools:** nodemon, dotenv

---

## 👩‍💻 Autora

Proyecto académico desarrollado para el curso de Arquitectura de Software — USMP.
