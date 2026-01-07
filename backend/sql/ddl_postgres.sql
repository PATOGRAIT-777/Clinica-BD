-- DDL inicial para PostgreSQL (nombres en español, sin acentos ni ñ)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: usuarios
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text,
  rol text NOT NULL CHECK (rol IN ('cliente','medico','recepcionista','admin')),
  nombre_completo text,
  telefono text,
  direccion jsonb,
  avatar_url text,
  meta jsonb,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Tabla: mascotas
CREATE TABLE mascotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  propietario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  ruac text UNIQUE,
  nombre text NOT NULL,
  tipo text,
  raza text,
  fecha_nacimiento date,
  sexo text,
  peso numeric,
  esterilizado boolean DEFAULT false,
  microchip text,
  comportamiento text,
  condiciones_cronicas text,
  alergias text,
  medicamentos text,
  imagen_url text,
  meta jsonb,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_mascotas_propietario ON mascotas(propietario_id);
CREATE INDEX idx_mascotas_ruac ON mascotas(ruac);

-- Tabla: sucursales
CREATE TABLE sucursales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  direccion jsonb,
  telefono text,
  zona_horaria text,
  meta jsonb,
  creado_en timestamptz DEFAULT now()
);

-- Tabla: medicos
CREATE TABLE medicos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre text,
  sucursal_id uuid REFERENCES sucursales(id),
  especialidades text[],
  horario_disponible jsonb,
  meta jsonb,
  creado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_medicos_sucursal ON medicos(sucursal_id);

-- Tabla: citas
CREATE TABLE citas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mascota_id uuid REFERENCES mascotas(id) ON DELETE SET NULL,
  propietario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  medico_id uuid REFERENCES medicos(id),
  sucursal_id uuid REFERENCES sucursales(id),
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada','completada')),
  procedimiento text,
  creado_por uuid REFERENCES usuarios(id),
  meta jsonb,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_citas_medico_fecha ON citas(medico_id, fecha);
-- Evitar doble reserva: unico por medico/fecha/hora_inicio cuando el estado es pendiente o confirmada
CREATE UNIQUE INDEX ux_citas_medico_slot ON citas(medico_id, fecha, hora_inicio) WHERE estado IN ('pendiente','confirmada');

-- Tabla: visitas (expediente)
CREATE TABLE visitas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mascota_id uuid REFERENCES mascotas(id) NOT NULL,
  medico_id uuid REFERENCES medicos(id) NOT NULL,
  propietario_id uuid REFERENCES usuarios(id),
  atendido_en timestamptz NOT NULL DEFAULT now(),
  notas text,
  diagnostico text,
  tratamientos text,
  recetas jsonb,
  archivos jsonb,
  creado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_visitas_mascota ON visitas(mascota_id);

-- Tabla: productos
CREATE TABLE productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  stock integer DEFAULT 0,
  categoria text,
  imagenes jsonb,
  meta jsonb,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- Tabla: ordenes
CREATE TABLE ordenes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id),
  items jsonb,
  total numeric,
  sucursal_id uuid REFERENCES sucursales(id),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','procesando','enviado','entregado','cancelado')),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Tabla: inventario (por sucursal)
CREATE TABLE inventario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id uuid REFERENCES productos(id),
  sucursal_id uuid REFERENCES sucursales(id),
  cantidad integer DEFAULT 0,
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE(producto_id, sucursal_id)
);

-- Tabla: razas
CREATE TABLE razas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  especie text,
  nombre text NOT NULL
);
CREATE INDEX idx_razas_especie ON razas(especie);

-- Tabla: mx_divisiones
CREATE TABLE mx_divisiones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estado text,
  municipio text,
  colonia text,
  codigo_postal text,
  meta jsonb
);
CREATE INDEX idx_mx_divisiones_cp ON mx_divisiones(codigo_postal);

-- Tabla: archivos (uploads locales)
CREATE TABLE archivos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla_propietaria text,
  id_propietario uuid,
  url text,
  nombre_archivo text,
  mime text,
  tamano integer,
  subido_en timestamptz DEFAULT now()
);

-- Opcional: tabla sesiones/refresh tokens (si se usan)
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id),
  token text,
  expiracion timestamptz,
  creado_en timestamptz DEFAULT now()
);

-- Fin del DDL inicial
