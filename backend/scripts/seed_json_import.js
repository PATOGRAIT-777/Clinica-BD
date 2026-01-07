/*
  Script de ejemplo para insertar branches.json, razas.json y mx_divisions.json en Postgres.
  Requisitos: Node.js, paquete 'pg'. Ejecutar con: node seed_json_import.js <path_to_project_root>

  Nota: ajusta las rutas a los JSON según la estructura de tu proyecto.
*/

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.argv[2]) {
  console.error('Usage: node seed_json_import.js <project_root_path>');
  process.exit(1);
}

const root = process.argv[2];
const branchesFile = path.join(root, 'public_html', 'admin', 'branches.json');
const razasFile = path.join(root, 'public_html', 'admin', 'razas.json');
const mxFile = path.join(root, 'public_html', 'admin', 'mx_divisions.json');

// Configura según tu entorno local
const client = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || '==PATOGRAIT777==',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function run(){
  await client.connect();
  try {
    // Branches
    if (fs.existsSync(branchesFile)){
      const bdata = JSON.parse(fs.readFileSync(branchesFile,'utf8'));
      // asume estructura { branches: [ { id, name, address, ... } ] } o similar
      const branches = bdata.branches || bdata;
      for(const b of branches){
        const text = `INSERT INTO sucursales(nombre, direccion, telefono, zona_horaria, meta) VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (id) DO UPDATE SET nombre=EXCLUDED.nombre, direccion=EXCLUDED.direccion`;
        const vals = [b.name || b.nombre || 'Sucursal', JSON.stringify(b.address||{}), b.phone||null, b.timezone||null, JSON.stringify(b)];
        await client.query(text, vals);
      }
      console.log('Branches importados:', branches.length);
    } else console.warn('branches.json no encontrado en', branchesFile);

    // Razas
    if (fs.existsSync(razasFile)){
      const rdata = JSON.parse(fs.readFileSync(razasFile,'utf8'));
      // Si razas.json es un objeto por especie: { "Perros": ["Labrador", ...], ... }
      if (Array.isArray(rdata)){
        for(const name of rdata){
          await client.query('INSERT INTO razas(especie,nombre) VALUES ($1,$2) ON CONFLICT DO NOTHING', ['', name]);
        }
      } else {
        for(const especie of Object.keys(rdata)){
          const lista = rdata[especie] || [];
          for(const name of lista){
            await client.query('INSERT INTO razas(especie,nombre) VALUES ($1,$2) ON CONFLICT DO NOTHING', [especie, name]);
          }
        }
      }
      console.log('Razas importadas');
    } else console.warn('razas.json no encontrado en', razasFile);

    // MX Divisiones
    if (fs.existsSync(mxFile)){
      const mx = JSON.parse(fs.readFileSync(mxFile,'utf8'));
      // mx expected: { Estado: { Municipio: [colonia1, colonia2, ...] } }
      let count = 0;
      for(const estado of Object.keys(mx)){
        const municipios = mx[estado] || {};
        for(const municipio of Object.keys(municipios)){
          const colonias = municipios[municipio] || [];
          for(const colonia of colonias){
            await client.query('INSERT INTO mx_divisiones(estado, municipio, colonia, codigo_postal, meta) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [estado, municipio, colonia, null, JSON.stringify({source: 'mx_divisions'})]);
            count++;
          }
        }
      }
      console.log('MX divisiones importadas (aprox):', count);
    } else console.warn('mx_divisions.json no encontrado en', mxFile);

  } catch (err) {
    console.error('Error durante import:', err);
  } finally {
    await client.end();
  }
}

run();
