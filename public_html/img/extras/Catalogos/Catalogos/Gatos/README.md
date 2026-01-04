####EN ESTE ARCHIVO VERA COMO CARGAR LOS ARCHIVOS CSV EN SU BASE DE DATOS#####
####INGRESE COMO USUARIO POSTGRES Y CONECTESE A SU BASE DE DATOS####
sudo -i -u postgres psql
\c name_database
###CREE LAS TABLAS NECESARIAS PARA IMPORTAR SUS ARCHIVOS#####
CREATE TABLE vacuna_gato
(
    ID_vacuna SERIAL NOT NULL, 
    ID_laboratorio int4 NOT NULL, 
    nombre varchar(50) NOT NULL, 
    ID_importancia int4 NOT NULL, 
    PRIMARY KEY (ID_vacuna)
);
CREATE TABLE importancia_gato (
    ID_importancia SERIAL NOT NULL, 
    importancia varchar(20) NOT NULL, 
    PRIMARY KEY (ID_importancia)
);
CREATE TABLE laboratorio_gato (
    ID_laboratorio SERIAL NOT NULL, 
    nombre varchar(60) NOT NULL, 
    PRIMARY KEY (ID_laboratorio)
    );
CREATE TABLE enfermedad_gato (
    ID_enfermedad SERIAL NOT NULL, 
    nombre varchar(50) NOT NULL, 
    agente_causal varchar(30) NOT NULL, 
    ID_tipo int4 NOT NULL, 
    sintomas varchar(100) NOT NULL, 
    transmision varchar(80) NOT NULL, 
    tratamiento varchar(100) NOT NULL, 
    PRIMARY KEY (ID_enfermedad)
    );
CREATE TABLE tipo_gato (
    ID_tipo SERIAL NOT NULL, 
    nombre varchar(25) NOT NULL, 
    PRIMARY KEY (ID_tipo)
    );
CREATE TABLE alergia_gato (
    ID_alergia SERIAL NOT NULL, 
    nombre varchar(60) NOT NULL, 
    agente_causal varchar(60) NOT NULL, 
    sintomas varchar(60) NOT NULL, 
    tratamiento varchar(100) NOT NULL, 
    tipo varchar(30) NOT NULL, 
    PRIMARY KEY (ID_alergia)
    );
CREATE TABLE previene_gato (
    ID_vacuna int4 NOT NULL,
    ID_enfermedad int4 NOT NULL,
    PRIMARY KEY (ID_vacuna, ID_enfermedad),
    FOREIGN KEY (ID_vacuna) REFERENCES vacuna(ID_vacuna),
    FOREIGN KEY (ID_enfermedad) REFERENCES enfermedad(ID_enfermedad)
);

ALTER TABLE vacuna ADD CONSTRAINT FKvacuna587245 FOREIGN KEY (ID_importancia) REFERENCES importancia (ID_importancia);
ALTER TABLE vacuna ADD CONSTRAINT FKvacuna1762 FOREIGN KEY (ID_laboratorio) REFERENCES laboratorio (ID_laboratorio);
ALTER TABLE enfermedad ADD CONSTRAINT FKenfermedad825148 FOREIGN KEY (ID_tipo) REFERENCES tipo (ID_tipo);

#####UNA VEZ CREADAS LAS TABLAS EN LA BASE DE DATOS CON EL ARCHIVO .sql ADJUNTO EN LAS CARPETAS Y DENTRO DE LA BASE DE DATOS
INTRODUZCA LOS SIGUIENTES COMANDOS PARA CARGAR LOS DATOS EN LA BASE DE DATOS##############

-- Importar tabla importancia
\copy importancia_gato(ID_importancia, importancia) FROM '/home/usuario/csv/importancia.csv' CSV HEADER;

-- Importar tabla laboratorio
\copy laboratorio_gato(ID_laboratorio, nombre) FROM '/home/usuario/csv/laboratorio.csv' CSV HEADER;

-- Importar tabla tipo
\copy tipo_gato(ID_tipo, nombre) FROM '/home/usuario/csv/tipo.csv' CSV HEADER;

-- Importar tabla enfermedad
\copy enfermedad_gato(ID_enfermedad, nombre, agente_causal, ID_tipo, sintomas, transmision, tratamiento) 
FROM '/home/usuario/csv/enfermedad.csv' CSV HEADER;

-- Importar tabla vacuna
\copy vacuna_gato(ID_vacuna, ID_laboratorio, nombre, ID_importancia) FROM '/home/usuario/csv/vacuna.csv' CSV HEADER;

-- Importar tabla alergia
\copy alergia_gato(ID_alergia, nombre, agente_causal, sintomas, tratamiento, tipo) 
FROM '/home/usuario/csv/alergia.csv' CSV HEADER;

-- Importar tabla previene
\copy previene_gato(ID_vacuna, ID_enfermedad) FROM '/home/usuario/csv/previene.csv' CSV HEADER;

####COMPRUEBE EL CONTENIDO DE SU BASE DE DATOS#####

-- Ver primeras 10 filas de importancia
SELECT * FROM importancia_gato LIMIT 10;

-- Ver primeras 10 filas de laboratorio
SELECT * FROM laboratorio_gato LIMIT 10;

-- Ver primeras 10 filas de tipo
SELECT * FROM tipo_gatoLIMIT 10;

-- Ver primeras 10 filas de enfermedad
SELECT * FROM enfermedad_gato LIMIT 10;

-- Ver primeras 10 filas de vacuna
SELECT * FROM vacuna_gato LIMIT 10;

-- Ver primeras 10 filas de alergia
SELECT * FROM alergia_gato LIMIT 10;

-- Ver primeras 10 filas de previene
SELECT * FROM previene_gato LIMIT 10;

