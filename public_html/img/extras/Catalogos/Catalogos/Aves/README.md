####EN ESTE ARCHIVO VERA COMO CARGAR LOS ARCHIVOS CSV EN SU BASE DE DATOS#####
####INGRESE COMO USUARIO POSTGRES Y CONECTESE A SU BASE DE DATOS####
sudo -i -u postgres psql
\c name_database
###CREE LAS TABLAS NECESARIAS PARA IMPORTAR SUS ARCHIVOS#####
-- Tabla de enfermedades
CREATE TABLE enfermedades_aves (
    id_enfermedad SERIAL PRIMARY KEY,
    nombre_enfermedad VARCHAR(100),
    causa TEXT,
    forma_transmision TEXT,
    sintomas TEXT,
    tratamiento TEXT,
    tipo VARCHAR(50),
    clasificacion VARCHAR(50)
);

-- Tabla de vacunas
CREATE TABLE vacunas_ave (
    id_vacAve SERIAL PRIMARY KEY,
    laboratorio VARCHAR(100),
    nombre_vac VARCHAR(100),
    cura TEXT,
    tipo_vac VARCHAR(50)
);


#####UNA VEZ CREADAS LAS TABLAS EN LA BASE DE DATOS CON EL ARCHIVO .sql ADJUNTO EN LAS CARPETAS Y DENTRO DE LA BASE DE DATOS
#####INTRODUZCA LOS SIGUIENTES COMANDOS PARA CARGAR LOS DATOS EN LA BASE DE DATOS##############

-- Importar enfermedades
\copy enfermedades_aves(nombre_enfermedad, causa, forma_transmision, sintomas, tratamiento, tipo, clasificacion)
FROM '/ruta/Enfermedades_aves.csv'
DELIMITER ',' CSV HEADER;

-- Importar vacunas
\copy vacunas_ave(id_vacAve, laboratorio, nombre_vac, cura, tipo_vac)
FROM '/ruta/Vacunas_ave.csv'
DELIMITER ',' CSV HEADER;


####COMPRUEBE EL CONTENIDO DE SU BASE DE DATOS#####

SELECT * FROM enfermedades_aves LIMIT 10;
SELECT * FROM vacunas_ave LIMIT 10;


