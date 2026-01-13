# Backend - Sistema de Gestión de Veterinaria

## Visión General

Este es el backend para un sistema de gestión de veterinaria, construido con Node.js y Express. Proporciona una API RESTful para gestionar pacientes, citas, inventario y más. También se encarga de servir el frontend de la aplicación, que es una aplicación cliente estática (HTML/CSS/JS).

## Arquitectura

### Backend
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL, interactúa a través de la librería `pg`.
- **Autenticación**: Basada en JSON Web Tokens (JWT) para proteger las rutas.
- **Carga de Rutas Dinámica**: El servidor carga automáticamente todas las rutas definidas como archivos `.js` en el directorio `backend/src/routes`. Cada archivo se monta en una ruta base que coincide con su nombre de archivo (p. ej., `citas.js` se monta en `/api/citas`).
- **Servidor de Archivos**:
  - Sirve el frontend estático desde el directorio `public_html` en la raíz del proyecto.
  - Sirve los archivos subidos (imágenes) desde `backend/uploads`.

### Frontend
- **Tecnología**: HTML, CSS y JavaScript estático.
- **Ubicación**: `public_html`.
- **Comunicación**: El frontend se comunica con el backend a través de las rutas `/api/*`.

### Base de Datos
- **Motor**: PostgreSQL.
- **Esquema**: La estructura completa de la base de datos (tablas, relaciones, etc.) se define en el archivo `backend/sql/ddl_postgres.sql`.

## Cómo Empezar

### Prerrequisitos
- Node.js y npm instalados.
- PostgreSQL instalado y un servidor corriendo.

### Pasos de Instalación

1.  **Clonar el Repositorio** (si aplica).

2.  **Instalar Dependencias**: Desde la raíz del proyecto, ejecuta:
    ```bash
    npm install
    ```

3.  **Crear y Configurar la Base de Datos**:
    a. Crea la base de datos en PostgreSQL:
    ```bash
    # Reemplaza 'techside' si usas un nombre diferente en tu .env
    createdb techside
    ```
    b. Ejecuta el script DDL para crear la estructura de tablas:
    ```bash
    psql -d techside -f backend/sql/ddl_postgres.sql
    ```

4.  **Configurar Variables de Entorno**:
    En la carpeta `backend`, crea un archivo `.env` (puedes copiar de `.env.example` si existe). Edita las variables para que coincidan con tu configuración local.

    **Archivo `backend/.env`:**
    ```ini
    # === Configuración de la Base de Datos ===
    DB_USER=tu_usuario_postgres
    DB_HOST=localhost
    DB_DATABASE=techside
    DB_PASSWORD=tu_contraseña_de_postgres
    DB_PORT=5432

    # === Configuración de Seguridad ===
    JWT_SECRET=un_secreto_muy_fuerte_y_largo

    # === Configuración del Servidor ===
    PORT=3000
    ```

5.  **(Opcional) Poblar la Base de Datos (Seeding)**:
    Si existe un script de seeding, puedes ejecutarlo para llenar la base de datos con datos de prueba.
    ```bash
    # Ejemplo (verificar si el script existe en backend/scripts/)
    node backend/scripts/seed_json_import.js
    ```

## Cómo Correr la Aplicación

Para iniciar el servidor, ejecuta el siguiente comando desde la raíz del proyecto:
```bash
npm run start:backend
```
El servidor se iniciará en `http://localhost:3000`. Al abrir esta URL en tu navegador, verás el frontend de la aplicación.

## Documentación de la API

La API está documentada usando la especificación OpenAPI en el archivo `openapi.yaml`.

### Rutas Dinámicas
Cualquier archivo `.js` que agregues a la carpeta `backend/src/routes` se convertirá automáticamente en un endpoint de la API. Por ejemplo, crear `productos.js` lo expondrá en `http://localhost:3000/api/productos`.

### Ejemplos de Endpoints

A continuación se muestran algunos de los endpoints principales. Todas las rutas que requieren autenticación esperan un token JWT en la cabecera `Authorization` con el formato `Bearer <token>`.

#### Autenticación (`/api/auth`)
- **`POST /login`**: Inicia sesión.
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Respuesta**: `{ token, user: { id, nombre, email, rol } }`
- **`POST /register`**: Registra un nuevo usuario.

#### Sucursales (`/api/sucursales`)
- **`GET /`**: Obtiene todas las sucursales.

#### Citas (`/api/citas`)
- **`GET /init-data`**: Obtiene los datos iniciales para la página de citas (sucursales, servicios).
- **`GET /medicos/:sucursalId`**: Obtiene los médicos de una sucursal.
- **`GET /horarios-disponibles`**: Obtiene los horarios disponibles para un médico en una fecha.

#### Divisiones de México (`/api/mxDivisions`)
- **`GET /states`**: Obtiene una lista de todos los estados de México.
- **`GET /municipalities/:estado`**: Obtiene los municipios de un estado.
