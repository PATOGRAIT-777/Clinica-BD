#  Catálogo de Enfermedades y Alergias en Reptiles

Este repositorio contiene dos catálogos en formato CSV con información relacionada con enfermedades y alergias que afectan a los reptiles. 
Los archivos pueden importarse fácilmente a una base de datos **PostgreSQL** usando la herramienta de línea de comandos **psql**.

---

##  Archivos incluidos

| Archivo | Descripción |
|----------|--------------|
| `ENFERMEDADES REPTILES(Enfermedades).csv` | Contiene el catálogo general de enfermedades en reptiles. |
| `ENFERMEDADES REPTILES(Alergias).csv` | Contiene el catálogo de alergias o reacciones asociadas. |

---
#### INGRESE COMO USUARIO POSTGRES Y CONECTESE A SU BASE DE DATOS
sudo -i -u postgres psql
\c name_database

### Script SQL de creación de tablas

```sql

-- Crear tabla de enfermedades
CREATE TABLE Enfermedad_reptil(
    id_enfermedades_reptil SERIAL PRIMARY KEY,
    nombre_enf VARCHAR(50) NOT NULL,
    causa_enf VARCHAR(200) NOT NULL,
    transmicion_enf VARCHAR(200) NOT NULL,
    sintomas_enf VARCHAR(300) NOT NULL,
    reptil_predispuesto VARCHAR(50) NOT NULL,
    tratamiento_enf VARCHAR(200) NOT NULL,
    clasificacion_enf VARCHAR(50) NOT NULL
);


CREATE TABLE Alergia_reptil(
    id_alergias_reptil SERIAL PRIMARY KEY,
    nombre_ale VARCHAR(50) NOT NULL,
    reaccion_ale  VARCHAR(100) NOT NULL,
    alergeno_ale  VARCHAR(100) NOT NULL,
    sintomas_ale  VARCHAR(300) NOT NULL,
    reptil_ale  VARCHAR(50) NOT NULL,
    tratamiento_ale VARCHAR(300) NOT NULL,
    clasificacion_ale  VARCHAR(50) NOT NULL
);
```

*Ajusta las columnas y tipos de datos según las columnas reales de tus archivos CSV.*

---

##  Importación de los catálogos a PostgreSQL

Asegúrate de ubicar los archivos CSV en un directorio accesible: 
`/home/usuario/catalogos/`

Ejecuta los siguientes comandos desde tu terminal Linux:

```bash
#  Acceder a PostgreSQL con tu usuario
psql -U postgres

#  Crear la base de datos y tablas
\i crear_tablas.sql
```

(Asumiendo que guardaste el script anterior como `crear_tablas.sql`)

---

###  Importar los archivos CSV

Ejecuta los siguientes comandos dentro de `psql`:

```sql
\c name_db;

\copy enfermedades(nombre, tipo, sintomas, tratamiento)
FROM '/home/usuario/catalogos/ENFERMEDADES REPTILES(Enfermedades).csv'
DELIMITER ',' CSV HEADER;

\copy alergias(nombre, agente_causal, sintomas, tratamiento)
FROM '/home/usuario/catalogos/ENFERMEDADES REPTILES(Alergias).csv'
DELIMITER ',' CSV HEADER;
```

---

##  Verificación

Para comprobar que los datos se importaron correctamente:

```sql
SELECT COUNT(*) FROM enfermedades;
SELECT COUNT(*) FROM alergias;

-- Mostrar algunos registros
SELECT * FROM enfermedades LIMIT 5;
SELECT * FROM alergias LIMIT 5;
```

---

