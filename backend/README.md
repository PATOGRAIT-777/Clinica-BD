# Backend local — Instrucciones

Este README contiene las instrucciones para configurar y correr tanto la base de datos PostgreSQL como el servidor de backend (Node.js/Express).

## 1. Base de Datos (PostgreSQL)

### Requisitos Previos
- PostgreSQL instalado y corriendo localmente.
- Node.js y npm instalados.

### Pasos de Configuración

**1.1) Crear la Base de Datos**
```bash
# Reemplaza 'techside' con el nombre de tu base de datos si lo cambiaste en el .env
createdb techside
```

**1.2) Ejecutar el DDL (Data Definition Language)**
Este comando creará toda la estructura de tablas, relaciones e índices necesarios para la aplicación.
```bash
# Ejecutar desde la raíz del proyecto
psql -d techside -f backend/sql/ddl_postgres.sql
```

## 2. Servidor Backend (Node.js/Express)

### Pasos de Configuración

**2.1) Configurar Variables de Entorno**
Crea una copia del archivo `.env.example` ubicado en la carpeta `backend`, renómbralo a `.env` y edita las variables con tu configuración local.

**Archivo `backend/.env`:**
```ini
# === Configuración de la Base de Datos ===
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_DATABASE=techside # Asegúrate que coincida con la DB que creaste
DB_PASSWORD=tu_contraseña_de_postgres
DB_PORT=5432

# === Configuración de Seguridad ===
# Secreto para firmar los JSON Web Tokens (JWT). Usa algo largo y aleatorio.
JWT_SECRET=un_secreto_muy_fuerte_y_largo_que_nadie_pueda_adivinar

# === Configuración del Servidor ===
PORT=3000
```

**2.2) Instalar Dependencias**
Desde la raíz del proyecto, ejecuta `npm install` para instalar todas las dependencias del proyecto (backend y frontend si aplica).
```bash
# Ejecutar desde la raíz del proyecto
npm install
```

**2.3) Poblar la Base de Datos (Seeding)**
Ejecuta este script para limpiar las tablas y llenarlas con datos iniciales de los archivos JSON (sucursales, médicos, razas, etc.).
**Nota:** Este script creará usuarios para los médicos con la contraseña por defecto: `password123`.

```bash
# Ejecutar desde la raíz del proyecto
node backend/scripts/seed_json_import.js
```

**2.4) Iniciar el Servidor**
Usa el script de npm para iniciar el servidor. Este escuchará los cambios en los archivos y se reiniciará automáticamente.
```bash
# Ejecutar desde la raíz del proyecto
npm run start:backend
```
El servidor estará corriendo en `http://localhost:3000`.

---

# Documentación de la API

Todas las rutas que requieren autenticación esperan un token JWT en la cabecera `Authorization` con el formato `Bearer <token>`.

## Autenticación (`/api/auth`)

- **`POST /register`**: Registra un nuevo usuario.
  - **Body**: `{ "nombre_completo": "...", "email": "...", "password": "...", "rol": "cliente" }`
  - **Rol (opcional)**: Puede ser `cliente`, `medico`, `recepcionista`, `admin`. Si no se provee, es `cliente`.
  - **Respuesta**: `{ token, user: { id, nombre, email, rol } }`

- **`POST /login`**: Inicia sesión.
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Respuesta**: `{ token, user: { id, nombre, email, rol } }`

## Sucursales (`/api/sucursales`)

- **`GET /`**: Obtiene todas las sucursales. (Público)
- **`GET /:id`**: Obtiene una sucursal por su UUID. (Público)
- **`POST /`**: Crea una nueva sucursal. (**Admin**)
  - **Body**: `{ "nombre": "...", "direccion": { "calle": "...", "ciudad": "..." }, "telefono": "..." }`
- **`PUT /:id`**: Actualiza una sucursal. (**Admin**)
- **`DELETE /:id`**: Elimina una sucursal. (**Admin**)

## Mascotas (`/api/mascotas`)

- **`GET /`**: Obtiene mascotas.
  - **Clientes**: Ven solo sus propias mascotas.
  - **Otros roles**: Ven todas las mascotas.
- **`POST /`**: Crea una nueva mascota. (**Cliente, Recepcionista, Admin**)
  - **Body**: `{ "propietario_id": "(opcional, solo para admin/recepcionista)", "nombre": "...", "tipo": "perro", "raza": "Labrador", "fecha_nacimiento": "YYYY-MM-DD", "sexo": "Macho" }`
- **`GET /:id`**: Obtiene una mascota por UUID.
  - **Clientes**: Solo pueden ver sus propias mascotas.
- **`PUT /:id`**: Actualiza una mascota. (**Propietario, Recepcionista, Admin**)
- **`DELETE /:id`**: Elimina una mascota. (**Recepcionista, Admin**)

## Citas (`/api/citas`)

- **`GET /`**: Obtiene una lista de citas.
  - **Query Params (opcional)**: `?fecha=YYYY-MM-DD&sucursal_id=uuid&medico_id=uuid&estado=...`
  - **Clientes**: Ven solo sus citas.
  - **Médicos**: Ven solo las citas asignadas a ellos.
  - **Recepcionistas/Admins**: Pueden filtrar y ver todas.
- **`POST /`**: Crea una nueva cita. (**Cliente, Recepcionista, Admin**)
  - **Body**: `{ "mascota_id": "...", "medico_id": "...", "sucursal_id": "...", "fecha": "YYYY-MM-DD", "hora_inicio": "HH:MM", "procedimiento": "Consulta general" }`
- **`PUT /:id/estado`**: Actualiza el estado de una cita.
  - **Body**: `{ "estado": "confirmada" }`
  - **Permisos**:
    - **Cliente**: Solo puede cambiar a `cancelada`.
    - **Médico**: Solo puede cambiar a `completada`.
    - **Recepcionista/Admin**: Pueden cambiar a `confirmada` o `cancelada`.
- **`DELETE /:id`**: Elimina una cita permanentemente. (**Recepcionista, Admin**)

## Expedientes / Visitas

- **`GET /api/mascotas/:mascotaId/visitas`**: Obtiene el historial de visitas (expediente) de una mascota.
  - **Acceso**: **Propietario, Médico, Admin**.
- **`POST /api/visitas`**: Crea una nueva entrada en el expediente (una visita). (**Médico, Admin**)
  - **Body**: `{ "mascota_id": "...", "propietario_id": "...", "notas": "...", "diagnostico": "...", "tratamientos": "...", "recetas": {} }`
- **`GET /api/visitas/:id`**: Obtiene el detalle de una visita específica.
  - **Acceso**: **Propietario, Médico, Admin**.