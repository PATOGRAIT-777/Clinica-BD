CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text,
  full_name text,
  phone text,
  role text NOT NULL CHECK (role IN ('cliente','medico','recepcionista','admin')),
  address jsonb,
  avatar_url text,
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE pets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ruac text UNIQUE,
  name text NOT NULL,
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_pets_owner ON pets(owner_id);

CREATE INDEX idx_pets_ruac ON pets(ruac);
CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address jsonb,
  phone text,
  timezone text,
  meta jsonb
);

CREATE TABLE doctors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text,
  branch_id uuid REFERENCES branches(id),
  specialties text[], -- or jsonb
  available_schedule jsonb,
  meta jsonb
);
CREATE INDEX idx_doctors_branch ON doctors(branch_id);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id),
  branch_id uuid REFERENCES branches(id),
  date date NOT NULL,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'pending',
  procedure text,
  created_by uuid REFERENCES users(id),
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_appt_doctor_date ON appointments(doctor_id, date);

CREATE UNIQUE INDEX ux_doctor_slot ON appointments(doctor_id, date, start_time) WHERE status IN ('pending','confirmed');
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid REFERENCES pets(id),
  doctor_id uuid REFERENCES doctors(id),
  owner_id uuid REFERENCES users(id),
  visit_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  diagnosis text,
  treatments text,
  prescriptions jsonb,
  files jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_visits_pet ON visits(pet_id);

CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid REFERENCES pets(id),
  doctor_id uuid REFERENCES doctors(id),
  owner_id uuid REFERENCES users(id),
  visit_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  diagnosis text,
  treatments text,
  prescriptions jsonb,
  files jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_visits_pet ON visits(pet_id);

CREATE TABLE products ( id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), sku text, name text, description text, price numeric, stock int, category text, images jsonb, meta jsonb );
CREATE TABLE orders ( id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid REFERENCES users(id), items jsonb, total numeric, branch_id uuid REFERENCES branches(id), status text, created_at timestamptz DEFAULT now() );