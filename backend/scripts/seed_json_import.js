/*
  Script para poblar la base de datos (seeding) a partir de archivos JSON.
  - Limpia las tablas relevantes antes de insertar.
  - Utiliza variables de entorno para la configuración de la DB (.env).
  - Inserta sucursales, y luego crea usuarios y perfiles para los médicos asociados.
  - Inserta razas y divisiones territoriales de México.

  Uso: node backend/scripts/seed_json_import.js
*/

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno desde ../../.env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Rutas a los archivos JSON, relativas a la ubicación del script
const branchesFile = path.join(__dirname, '../../../public_html/admin/branches.json');
const razasFile = path.join(__dirname, '/razas.json');
const mxFile = path.join(__dirname, '/mx_divisions.json');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedDatabase() {
  await client.connect();
  // Iniciar transacción
  await client.query('BEGIN');

  try {
    console.log('Limpiando tablas existentes...');
    // Se truncan en orden inverso a las dependencias para evitar errores de FK
    await client.query('TRUNCATE TABLE medicos, usuarios, sucursales, razas, mx_divisiones RESTART IDENTITY CASCADE');

    // --- SUCURSALES Y MÉDICOS ---
    if (fs.existsSync(branchesFile)) {
      console.log('Importando Sucursales y Médicos...');
      const bdata = JSON.parse(fs.readFileSync(branchesFile, 'utf8'));
      const branches = bdata.branches || bdata;

      for (const branch of branches) {
        // Insertar sucursal y obtener su nuevo ID
        const sucursalRes = await client.query(
          'INSERT INTO sucursales(nombre, direccion, telefono) VALUES ($1, $2, $3) RETURNING id',
          [branch.name, JSON.stringify({ "direccion": branch.address }), branch.phone || null]
        );
        const sucursalId = sucursalRes.rows[0].id;
        console.log(`- Sucursal '${branch.name}' creada con ID: ${sucursalId}`);

        // Insertar médicos asociados
        if (branch.doctors && branch.doctors.length > 0) {
          for (const doc of branch.doctors) {
            // 1. Crear el usuario para el médico
            const email = `${doc.name.toLowerCase().replace(/\s/g, '.')}@techside.com`;
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt); // Contraseña por defecto

            const userRes = await client.query(
              `INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, 'medico') RETURNING id`,
              [doc.name, email, password_hash]
            );
            const usuarioId = userRes.rows[0].id;

            // 2. Crear el perfil del médico
            await client.query(
              `INSERT INTO medicos (id, usuario_id, nombre, sucursal_id, especialidades) VALUES (DEFAULT, $1, $2, $3, $4)`,
              [usuarioId, doc.name, sucursalId, [doc.specialty]]
            );
            console.log(`  - Médico '${doc.name}' creado y asignado a '${branch.name}'.`);
          }
        }
      }
    } else {
      console.warn(`Archivo no encontrado: ${branchesFile}`);
    }

    // --- RAZAS ---
    if (fs.existsSync(razasFile)) {
      console.log('Importando Razas...');
      const rdata = JSON.parse(fs.readFileSync(razasFile, 'utf8'));
      for (const especie of Object.keys(rdata)) {
        for (const nombre of rdata[especie]) {
          await client.query('INSERT INTO razas(especie, nombre) VALUES ($1, $2)', [especie, nombre]);
        }
      }
      console.log('- Razas importadas correctamente.');
    } else {
      console.warn(`Archivo no encontrado: ${razasFile}`);
    }

    // --- DIVISIONES DE MÉXICO ---
    if (fs.existsSync(mxFile)) {
      console.log('Importando Divisiones de México...');
      const mx = JSON.parse(fs.readFileSync(mxFile, 'utf8'));
      let count = 0;
      for (const estado of Object.keys(mx)) {
        const municipios = mx[estado] || {};
        for (const municipio of Object.keys(municipios)) {
          const colonias = municipios[municipio] || [];
          for (const colonia of colonias) { // colonia es un objeto {name, cp}
            await client.query(
              'INSERT INTO mx_divisiones(estado, municipio, colonia, codigo_postal) VALUES ($1, $2, $3, $4)',
              [estado, municipio, colonia.name, colonia.cp]
            );
            count++;
          }
        }
      }
      console.log(`- ${count} divisiones de México importadas.`);
    } else {
      console.warn(`Archivo no encontrado: ${mxFile}`);
    }

    // Si todo fue bien, confirmar la transacción
    await client.query('COMMIT');
    console.log('\n\u00A1Seed completado exitosamente!');

  } catch (err) {
    // Si algo falla, hacer rollback
    await client.query('ROLLBACK');
    console.error('\nError durante el proceso de seed. La transacción ha sido revertida.', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();