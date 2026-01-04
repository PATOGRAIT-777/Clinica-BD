#### EN ESTE ARCHIVO VERÁ CÓMO CARGAR SUS ARCHIVOS CSV EN SU BASE DE DATOS #####
#### INGRESE COMO USUARIO POSTGRES Y CONÉCTESE A SU BASE DE DATOS ####

sudo -i -u postgres psql
\c name_database

### CREE LAS TABLAS NECESARIAS PARA IMPORTAR SUS ARCHIVOS #####
# NOTA: Estas tablas usan INT como PRIMARY KEY porque los IDs ya vienen en sus archivos CSV.

CREATE TABLE TipoEnfermedadPerro (
    ID_TipoEPerro INT NOT NULL, 
    NombreTipo VARCHAR(100) NOT NULL,
    PRIMARY KEY (ID_TipoEPerro)
);

CREATE TABLE Laboratorios (
    ID_Lab INT NOT NULL, 
    NombreLab VARCHAR(100) NOT NULL,
    PRIMARY KEY (ID_Lab)
);

CREATE TABLE Vacunas_Perro (
    ID_VacunaPerro INT NOT NULL, 
    NombreVPerro VARCHAR(255) NOT NULL,
    EnfermedadVPerro VARCHAR(255),
    ImportanciaVPerro VARCHAR(100),
    PRIMARY KEY (ID_VacunaPerro)
);

CREATE TABLE Enfermedades_Perro (
    id_EnfermedadPerro INT NOT NULL, 
    NombreEPerro VARCHAR(255) NOT NULL,
    Agente_CausalEPerro TEXT,
    ID_TipoEPerro INT NOT NULL,
    SintomasEPerro TEXT,
    TransmisionEPerro TEXT,
    TratamientoEPerro TEXT,
    PrevencionEPerro TEXT,
    GravedadEPerro TEXT,
    PRIMARY KEY (id_EnfermedadPerro)
);

CREATE TABLE AlergiasPerro (
    ID_AlergiaPerro INT NOT NULL, 
    NombreAPerro VARCHAR(255) NOT NULL,
    Agente_CausalAPerro TEXT,
    SintomasAPerro TEXT,
    TratamientoAPerro TEXT,
    TipoAPerro VARCHAR(255),
    GravedadAPerro TEXT,
    EdadPredispuestaAPerro VARCHAR(100),
    PRIMARY KEY (ID_AlergiaPerro)
);

CREATE TABLE Laboratorio_Produce_Vacuna (
    ID_Lab INT NOT NULL,
    ID_VacunaPerro INT NOT NULL,
    NombreComercial VARCHAR(100),
    PRIMARY KEY (ID_Lab, ID_VacunaPerro)
);

-- Agregar las Llaves Foráneas (Foreign Keys)
ALTER TABLE Enfermedades_Perro ADD CONSTRAINT FKEnfermedadTipo FOREIGN KEY (ID_TipoEPerro) REFERENCES TipoEnfermedadPerro (ID_TipoEPerro);
ALTER TABLE Laboratorio_Produce_Vacuna ADD CONSTRAINT FKLaboratorio FOREIGN KEY (ID_Lab) REFERENCES Laboratorios (ID_Lab);
ALTER TABLE Laboratorio_Produce_Vacuna ADD CONSTRAINT FKVacuna FOREIGN KEY (ID_VacunaPerro) REFERENCES Vacunas_Perro (ID_VacunaPerro);


##### UNA VEZ CREADAS LAS TABLAS EN LA BASE DE DATOS (...)
INTRODUZCA LOS SIGUIENTES COMANDOS PARA CARGAR LOS DATOS EN LA BASE DE DATOS ##############
# (Asegúrese de cambiar '/home/usuario/csv/' a la ruta real donde guardó sus archivos)

-- Importar tabla TipoEnfermedadPerro
\copy TipoEnfermedadPerro(ID_TipoEPerro, NombreTipo) FROM '/home/usuario/csv/TipoEnfermedadPerro.csv' CSV HEADER;

-- Importar tabla Laboratorios (desde LaboratoriosVacunas.csv)
\copy Laboratorios(ID_Lab, NombreLab) FROM '/home/usuario/csv/LaboratoriosVacunas.csv' CSV HEADER;

-- Importar tabla Vacunas_Perro
\copy Vacunas_Perro(ID_VacunaPerro, NombreVPerro, EnfermedadVPerro, ImportanciaVPerro) FROM '/home/usuario/csv/Vacunas_Perro.csv' CSV HEADER;

-- Importar tabla Enfermedades_Perro
\copy Enfermedades_Perro(id_EnfermedadPerro, NombreEPerro, Agente_CausalEPerro, ID_TipoEPerro, SintomasEPerro, TransmisionEPerro, TratamientoEPerro, PrevencionEPerro, GravedadEPerro) FROM '/home/usuario/csv/Enfermedades_Perro.csv' CSV HEADER;

-- Importar tabla AlergiasPerro
\copy AlergiasPerro(ID_AlergiaPerro, NombreAPerro, Agente_CausalAPerro, SintomasAPerro, TratamientoAPerro, TipoAPerro, GravedadAPerro, EdadPredispuestaAPerro) FROM '/home/usuario/csv/AlergiasPerro.csv' CSV HEADER;

-- Importar tabla puente Laboratorio_Produce_Vacuna (desde Laboratorio_Vacuna.csv)
\copy Laboratorio_Produce_Vacuna(ID_Lab, ID_VacunaPerro, NombreComercial) FROM '/home/usuario/csv/Laboratorio_Vacuna.csv' CSV HEADER;


#### COMPRUEBE EL CONTENIDO DE SU BASE DE DATOS #####

-- Ver primeras 10 filas de TipoEnfermedadPerro
SELECT * FROM TipoEnfermedadPerro LIMIT 10;

-- Ver primeras 10 filas de Laboratorios
SELECT * FROM Laboratorios LIMIT 10;

-- Ver primeras 10 filas de Vacunas_Perro
SELECT * FROM Vacunas_Perro LIMIT 10;

-- Ver primeras 10 filas de Enfermedades_Perro
SELECT * FROM Enfermedades_Perro LIMIT 10;

-- Ver primeras 10 filas de AlergiasPerro
SELECT * FROM AlergiasPerro LIMIT 10;

-- Ver primeras 10 filas de Laboratorio_Produce_Vacuna
SELECT * FROM Laboratorio_Produce_Vacuna LIMIT 10;