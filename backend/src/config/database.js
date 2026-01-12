const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Configuración de variables de entorno
// Asume que este archivo está en 'src/' y el .env en la raíz del backend ('../.env')
dotenv.config({ path: path.join(__dirname, '../.env') });

// CORRECCIÓN IMPORTANTE PARA POSTGRES:
// Por defecto, PG devuelve los números DECIMAL/NUMERIC como strings.
// Esto los convierte automáticamente a flotantes (float) en Javascript.
var types = require('pg').types;
types.setTypeParser(1700, function(val) {
  return parseFloat(val);
});

// Configuración del Pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false // Cambiar a true si despliegas en producción (ej. Render/Heroku)
});

// Prueba de conexión inmediata al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERROR FATAL: No se pudo conectar a la Base de Datos.', err.stack);
  } else {
    console.log('✅ Base de Datos conectada exitosamente:', process.env.DB_DATABASE);
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};