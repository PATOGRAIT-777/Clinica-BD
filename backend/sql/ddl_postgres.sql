-- =================================================================
-- 1. LIMPIEZA Y PREPARACIÓN
-- =================================================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 2. SISTEMA DE ARCHIVOS
-- =================================================================
CREATE TABLE archivos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  nombre_archivo text,
  mime text,
  tamano integer,
  subido_en timestamptz DEFAULT now()
);

-- =================================================================
-- 3. CATÁLOGOS GLOBALES (Mascotas + Direcciones)
-- =================================================================

-- Especies, Razas, Colores, Pelaje, Comportamiento (Igual que antes)
CREATE TABLE especies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL
);

CREATE TABLE razas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  especie_id uuid REFERENCES especies(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  UNIQUE(especie_id, nombre)
);

CREATE TABLE colores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL
);

CREATE TABLE tipos_pelo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL
);

CREATE TABLE patrones_pelo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL
);

CREATE TABLE comportamientos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL,
  requiere_bozal boolean DEFAULT false
);

CREATE TABLE catalogo_alergias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL
);

CREATE TABLE especialidades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL, 
  descripcion text
);

CREATE TABLE servicios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL,
  precio_base numeric DEFAULT 0
);

CREATE TABLE categorias_producto (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text UNIQUE NOT NULL, -- Ej: 'Alimento', 'Farmacia', 'Accesorios', 'Higiene'
  descripcion text
);

-- [NUEVO] Catálogo de Direcciones (SEPOMEX)
-- Aquí cargarás tu JSON de estados/municipios para no duplicar textos
CREATE TABLE mx_divisiones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_postal text NOT NULL,
  colonia text NOT NULL,
  municipio text NOT NULL,
  estado text NOT NULL
);
-- Índice para que buscar por CP sea instantáneo en el formulario
CREATE INDEX idx_mx_cp ON mx_divisiones(codigo_postal); 

-- =================================================================
-- 4. SUCURSALES (Con Dirección Normalizada)
-- =================================================================

CREATE TABLE sucursales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL, 
  
  -- Dirección Física (Híbrida: Texto para calle + ID de catálogo)
  calle_numero text, -- "Av. Universidad 101 Int 2"
  ubicacion_id uuid REFERENCES mx_divisiones(id), -- El enlace al CP/Colonia
  mapa_coords text, -- "19.4326,-99.1332"
  
  -- Showroom
  descripcion_web text,
  horario_atencion text, 
  foto_portada_id uuid REFERENCES archivos(id), 
  galeria_fotos_ids uuid[],
  
  -- Contacto
  telefono_principal text,
  whatsapp text,
  
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE sucursal_correos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  correo text NOT NULL,
  etiqueta text
);

CREATE TABLE consultorios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  equipamiento text
);

CREATE TABLE sucursales_especialidades (
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  especialidad_id uuid REFERENCES especialidades(id) ON DELETE CASCADE,
  PRIMARY KEY (sucursal_id, especialidad_id)
);

-- =================================================================
-- 5. USUARIOS Y MÉDICOS (Con Dirección Normalizada)
-- =================================================================

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('cliente','medico','admin')),
  nombre_completo text NOT NULL,
  telefono text,
  telefono_secundario text,
  
  -- Dirección Normalizada
  calle text,
  num_exterior text,
  num_interior text,
  ubicacion_id uuid REFERENCES mx_divisiones(id), -- FK al catálogo de CP
  
  -- Documentos
  id_type text,    -- INE, Pasaporte
  id_number text, 
  proof_address_id uuid REFERENCES archivos(id),
  proof_id_id uuid REFERENCES archivos(id),
  
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE medicos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  sucursal_id uuid REFERENCES sucursales(id),
  especialidad_principal_id uuid REFERENCES especialidades(id),
  cedula_profesional text,
  biografia_corta text
);

-- =================================================================
-- 6. MASCOTAS (Igual que versión anterior)
-- =================================================================

CREATE TABLE mascotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  propietario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  
  -- FKs a Catálogos
  raza_id uuid REFERENCES razas(id),
  color_id uuid REFERENCES colores(id),
  tipo_pelo_id uuid REFERENCES tipos_pelo(id),
  patron_pelo_id uuid REFERENCES patrones_pelo(id),
  comportamiento_id uuid REFERENCES comportamientos(id),
  
  fecha_nacimiento date,
  sexo text CHECK (sexo IN ('Macho', 'Hembra')),
  peso numeric,
  esterilizado boolean DEFAULT false,
  
  ruac text,
  microchip text,
  tatuaje text,
  
  foto_perfil_id uuid REFERENCES archivos(id),
  carnet_vacunacion_id uuid REFERENCES archivos(id),
  observaciones text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE mascotas_alergias (
  mascota_id uuid REFERENCES mascotas(id) ON DELETE CASCADE,
  alergia_id uuid REFERENCES catalogo_alergias(id) ON DELETE CASCADE,
  notas text,
  PRIMARY KEY (mascota_id, alergia_id)
);

-- =================================================================
-- 7. CITAS Y EXPEDIENTE
-- =================================================================

CREATE TABLE citas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id),
  medico_id uuid REFERENCES medicos(id),
  mascota_id uuid REFERENCES mascotas(id),
  consultorio_id uuid REFERENCES consultorios(id),
  servicio_id uuid REFERENCES servicios(id),
  
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  estado text DEFAULT 'pendiente',
  motivo text
);

CREATE TABLE visitas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id uuid REFERENCES citas(id),
  mascota_id uuid REFERENCES mascotas(id),
  medico_id uuid REFERENCES medicos(id),
  
  atendido_en timestamptz DEFAULT now(),
  diagnostico text,
  tratamiento text,
  receta_texto text
);

-- =================================================================
-- 8. TIENDA DE PRODUCTOS
-- =================================================================

CREATE TABLE productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_sku text UNIQUE, -- Indispensable para lector de código de barras
  nombre text NOT NULL,
  descripcion text,
  precio_venta numeric NOT NULL, -- Precio al público
  costo_compra numeric,          -- Para saber cuánto ganas (utilidad)
  
  -- Clasificación
  categoria_id uuid REFERENCES categorias_producto(id),
  es_medicamento boolean DEFAULT false,
  requiere_receta boolean DEFAULT false, -- Para validación en farmacia.html
  
  -- Visuales
  imagen_url text,
  marca text,
  
  activo boolean DEFAULT true
);

CREATE TABLE inventario_sucursal (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id uuid REFERENCES sucursales(id),
  producto_id uuid REFERENCES productos(id),
  
  cantidad_existencia integer DEFAULT 0,
  stock_minimo integer DEFAULT 5, -- Para alertas de "Se está acabando"
  ubicacion_en_almacen text,      -- Ej: "Estante A, Repisa 3"
  
  fecha_actualizacion timestamptz DEFAULT now(),
  
  -- Evitar duplicados: Un producto solo aparece una vez por sucursal
  CONSTRAINT unico_producto_sucursal UNIQUE(sucursal_id, producto_id)
);

-- Cabecera de la Orden (El ticket general)
CREATE TABLE ordenes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id),
  sucursal_id uuid REFERENCES sucursales(id), -- Sucursal que surte
  
  fecha_compra timestamptz DEFAULT now(),
  total numeric NOT NULL,
  
  estado text CHECK (estado IN ('pendiente_pago', 'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'devolucion')),
  metodo_pago text,
  
  -- AQUÍ: Guardamos toda la dirección mezclada en un solo texto
  direccion_envio text NOT NULL
);

CREATE TABLE detalles_orden (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id uuid REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id),
  cantidad integer NOT NULL,
  precio_unitario numeric NOT NULL
);
-- =================================================================
-- 9. Contactos de Emergencia / Adicionales
-- =================================================================
CREATE TABLE contactos_usuarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE, -- Si se borra el usuario, se borran sus contactos
  nombre text NOT NULL,          -- Ej: "Juan Pérez"
  relacion text,                 -- Ej: "Familiar", "Vecino", "Amigo"
  telefono text NOT NULL,        -- Ej: "5512345678"
  creado_en timestamptz DEFAULT now()
);

-- Índice para buscar rápidamente los contactos de un usuario
CREATE INDEX idx_contactos_usuario ON contactos_usuarios(usuario_id);

-- =================================================================
-- 10. Gestion Medicos.
-- =================================================================
CREATE TABLE medico_horarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico_id uuid REFERENCES medicos(id) ON DELETE CASCADE,
  dia_semana int CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes...
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  
  -- Para evitar que un médico tenga horarios encimados el mismo día
  CONSTRAINT horario_unico_medico UNIQUE(medico_id, dia_semana, hora_inicio)
);

CREATE TABLE medico_asistencias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico_id uuid REFERENCES medicos(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  
  -- Para comparar con su horario teórico
  hora_entrada_real time,
  hora_salida_real time,
  
  estado text CHECK (estado IN ('Asistencia', 'Falta', 'Retardo', 'Justificado', 'Incapacidad')),
  observaciones text,
  
  creado_en timestamptz DEFAULT now()
);