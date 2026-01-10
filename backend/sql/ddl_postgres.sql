-- =========================================================
-- SCRIPT DE REINICIO TOTAL - CLINICA VETERINARIA
-- =========================================================

-- 1. Eliminar todo lo previo para evitar conflictos
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Activar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- TABLAS PRINCIPALES (NIVEL 1)
-- =========================================================

-- Tabla: Archivos (Debe ir primero porque todos la referencian)
CREATE TABLE archivos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla_propietaria text, -- Ej: 'mascotas', 'usuarios'
  id_propietario uuid,    -- ID del dueño del archivo
  url text NOT NULL,
  nombre_archivo text,
  mime text,
  tamano integer,
  subido_en timestamptz DEFAULT now()
);

-- Tabla: Usuarios (Núcleo del sistema)
-- NOTA: Dirección se queda en JSONB porque es solo informativa, no relacional crítica.
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('cliente','medico','recepcionista','admin')),
  nombre_completo text NOT NULL,
  telefono text,
  telefono_secundario text,
  direccion jsonb, -- {calle, numero, colonia, municipio, estado, cp}
  avatar_url text,
  
  -- IDs oficiales
  id_type text,    -- INE, Pasaporte
  id_number text, 
  
  -- Relaciones a archivos
  proof_address_id uuid REFERENCES archivos(id) ON DELETE SET NULL,
  proof_id_id uuid REFERENCES archivos(id) ON DELETE SET NULL,
  
  meta jsonb, -- Solo para configuraciones de usuario (tema oscuro, notificaciones, etc.)
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Tabla: Sucursales
-- NOTA: Eliminamos cualquier lista de médicos en JSON. La relación se hace en la tabla 'medicos'.
CREATE TABLE sucursales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  direccion jsonb, -- {calle, cp, coordenadas}
  telefono text,
  zona_horaria text DEFAULT 'America/Mexico_City',
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now()
);

-- =========================================================
-- TABLAS OPERATIVAS (NIVEL 2)
-- =========================================================

-- Tabla: Médicos
-- Relación corregida: Un médico pertenece a una sucursal.
CREATE TABLE medicos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE, -- Vincula con login
  sucursal_id uuid REFERENCES sucursales(id),
  cedula_profesional text,
  especialidades text[], -- Array de textos: ['Cirujano', 'Dermatólogo']
  horario_disponible jsonb, -- { lunes: {inicio: '09:00', fin: '18:00'} }
  creado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_medicos_sucursal ON medicos(sucursal_id);

-- Tabla: Mascotas
-- Actualizada con los campos nuevos que pediste (color, pelo, etc.)
CREATE TABLE mascotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  propietario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  
  -- Identificación
  ruac text,
  microchip text,
  tatuaje text,
  
  -- Físico
  especie text, -- Perro, Gato
  raza text,
  color text,
  patron text,
  tipo_pelo text,
  peso numeric,
  fecha_nacimiento date,
  sexo text CHECK (sexo IN ('Macho', 'Hembra')),
  esterilizado boolean DEFAULT false,
  
  -- Salud / Comportamiento
  comportamiento text,
  alergias text,
  observaciones text,
  
  -- Archivos
  imagen_url text,
  carnet_vacunacion_id uuid REFERENCES archivos(id) ON DELETE SET NULL,
  
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_mascotas_propietario ON mascotas(propietario_id);

-- =========================================================
-- TABLAS CLÍNICAS (NIVEL 3)
-- =========================================================

-- Tabla: Citas
CREATE TABLE citas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id),
  medico_id uuid REFERENCES medicos(id),
  mascota_id uuid REFERENCES mascotas(id) ON DELETE CASCADE,
  propietario_id uuid REFERENCES usuarios(id), -- Redundante útil para búsquedas rápidas
  
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time,
  
  motivo text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada','completada')),
  
  creado_en timestamptz DEFAULT now()
);

-- Tabla: Visitas (Expediente Médico)
CREATE TABLE visitas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id uuid REFERENCES citas(id), -- Opcional, puede haber visita de emergencia sin cita
  mascota_id uuid REFERENCES mascotas(id) NOT NULL,
  medico_id uuid REFERENCES medicos(id) NOT NULL,
  
  atendido_en timestamptz DEFAULT now(),
  motivo_consulta text,
  sintomas text,
  diagnostico text,
  tratamiento_indicado text,
  
  peso_actual numeric,
  temperatura numeric,
  
  notas_internas text, -- Solo visibles para médicos
  archivos_adjuntos jsonb -- Array de IDs de archivos (Radiografías, Análisis)
);

-- =========================================================
-- TABLAS E-COMMERCE E INVENTARIO (NIVEL 4 - NORMALIZADO)
-- =========================================================

-- Tabla: Productos (Catálogo)
CREATE TABLE productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  categoria text, -- Podría ser tabla aparte, pero texto está bien por ahora
  imagenes jsonb, -- Array de URLs
  controlado_farmacia boolean DEFAULT false, -- Si requiere receta
  activo boolean DEFAULT true
);

-- Tabla: Inventario (Relación Sucursal <-> Producto)
CREATE TABLE inventario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  cantidad integer DEFAULT 0 CHECK (cantidad >= 0),
  ubicacion_pasillo text,
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE(sucursal_id, producto_id) -- Evita duplicados
);

-- Tabla: Carrito de Compras (Temporal)
CREATE TABLE carrito_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  cantidad integer DEFAULT 1,
  agregado_en timestamptz DEFAULT now(),
  UNIQUE(usuario_id, producto_id)
);

-- Tabla: Listas de Deseos
CREATE TABLE lista_deseos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  tipo_lista text DEFAULT 'favoritos',
  agregado_en timestamptz DEFAULT now()
);

-- Tabla: Órdenes (Compras finalizadas)
CREATE TABLE ordenes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id),
  sucursal_origen_id uuid REFERENCES sucursales(id), -- De dónde sale el stock
  
  total numeric NOT NULL,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','enviado','entregado','cancelado')),
  
  direccion_envio jsonb,
  creado_en timestamptz DEFAULT now()
);

-- Tabla: Detalles de Orden (Esto reemplaza al 'items jsonb')
-- Permite saber exactamente qué se vendió y a qué precio en ese momento
CREATE TABLE orden_detalles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id uuid REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id),
  cantidad integer NOT NULL,
  precio_unitario numeric NOT NULL, -- Precio al momento de la compra
  subtotal numeric GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- Tabla: Recetas Médicas (Vinculada a Inventario)
-- Esto reemplaza 'recetas jsonb' en visitas. Permite descontar de farmacia.
CREATE TABLE recetas_medicas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  visita_id uuid REFERENCES visitas(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id), -- El medicamento
  dosis text, -- "1 pastilla cada 8 horas"
  cantidad integer, -- Cantidad a surtir
  surtido boolean DEFAULT false
);

-- =========================================================
-- TABLAS DE CATÁLOGOS SATÉLITE
-- =========================================================

CREATE TABLE catalogos_enfermedades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  especie text, 
  nombre text,
  tipo text -- 'Viral', 'Bacteriana', etc.
);

CREATE TABLE catalogos_vacunas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  especie text, 
  nombre text,
  laboratorio text
);

CREATE TABLE mx_divisiones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estado text,
  municipio text,
  colonia text,
  codigo_postal text
);