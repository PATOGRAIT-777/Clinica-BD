const { Pool } = require('pg');
const path = require('path');

// Corrección: Usamos path.join para encontrar el .env sin importar desde dónde ejecutes la terminal
// __dirname es la carpeta actual (src), así que subimos un nivel (..) para buscar el .env en 'backend'
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Corrección para números decimales
var types = require('pg').types;
types.setTypeParser(1700, function(val) { return parseFloat(val); });

// ... todo el código anterior de configuración ...

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false 
});

// Verificación (opcional)
if (!process.env.DB_PASSWORD) {
    console.error("❌ ERROR: No se leyó la contraseña.");
} else {
    console.log("✅ Conexión configurada con usuario:", process.env.DB_USER);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};