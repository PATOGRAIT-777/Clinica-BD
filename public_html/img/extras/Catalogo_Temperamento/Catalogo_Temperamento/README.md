Catalogo de Temperamento

Equipo:
Vergara Chischistz Jonathan Jesus
Mauricio Xavier Mejia Mejia
Martinez Andrade Fernando

Pasos para poder concectar con la bd
\c name_database


-- Tabla de temperamento
CREATE TABLE temperamento_manejo (
    id_comportamientos SERIAL PRIMARY KEY,
    rasgo_temperamento VARCHAR(150) NOT NULL,
    especie VARCHAR(20) NOT NULL,
    manejo_recomendado TEXT NOT NULL
);


Ya creadas la tabla junto con el archivo .sql, se introducen las siguientes comandos para cargar los datos en la bd

-- Importar
\copy enfetemperamento_manejormedades_aves(id_comportamientos, rasgo_temperamento, especie, manejo_recomendado)
FROM '/ruta/catalogo1_temperamento.csv'
DELIMITER ',' CSV HEADER;

Ya usando SELECT * FROM temperamento_manejo; podras verificar todos los datos en la tabla