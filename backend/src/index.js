const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 1. Configuración de Entorno
// Asume que index.js está en 'src/' y busca el .env un nivel arriba
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares Globales
app.use(cors()); // Permite que tu HTML (frontend) hable con este API
app.use(express.json()); // Permite recibir datos JSON en los POST

// 4. Servir Archivos Estáticos (Imágenes cargadas)
// Las fotos subidas estarán disponibles en http://localhost:3000/uploads/foto.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ... código anterior ...

// 5. Importación de Rutas (Endpoints)
// ... (código anterior igual)

const safeRequire = (relPath) => {
  try {
    return require(relPath);
  } catch (err) {
    console.warn(`⚠️ Ruta no cargada (falta archivo): ${relPath}`);
    // console.error(err); // Descomenta para ver el error real si persiste
    return null;
  }
};

// CORRECCIÓN: Usar ./ porque 'routes' está JUNTO a 'index.js' dentro de 'src'
const authRoutes = safeRequire('./routes/auth');
// Fíjate si tu variable se llama 'sucursalRoutes' o 'sucursalesRoutes'
const sucursalRoutes = safeRequire('./routes/sucursales');
const mascotaRoutes = safeRequire('./routes/mascotas');
const citaRoutes = require('./routes/citas'); // (O safeRequire, lo que uses)
const visitaRoutes = safeRequire('./routes/visitas');
const razaRoutes = safeRequire('./routes/razas');
const mxDivisionsRoutes = require('./routes/mxDivisions');
const uploadRoutes = safeRequire('./routes/upload');


// 6. Definición de Rutas
const mountedRoutes = [];

// ... otros app.use ...

// --- AGREGA ESTO ---
if (sucursalRoutes) {
    app.use('/api/sucursales', sucursalRoutes);
    mountedRoutes.push('/api/sucursales');
    console.log('✅ Ruta de Sucursales montada en /api/sucursales'); // Log para confirmar
}
// -------------------
if (citaRoutes) {
    app.use('/api/citas', citaRoutes); // <--- ESTA LÍNEA ES VITAL
    mountedRoutes.push('/api/citas');
}
// ...

// --- AGREGA ESTE BLOQUE AQUÍ ---

// Registrar rutas de Autenticación (si existe)
if (authRoutes) {
    app.use('/api/auth', authRoutes);
    mountedRoutes.push('/api/auth');
}

// Registrar rutas de Divisiones (ESTA ES LA QUE TE FALTA)
// Como usamos 'require' directo (sin safeRequire), no hace falta el 'if'
app.use('/api/mx-divisions', mxDivisionsRoutes);
mountedRoutes.push('/api/mx-divisions');

// Registrar rutas de Uploads (si existe)
if (uploadRoutes) {
    app.use('/api/upload', uploadRoutes);
    mountedRoutes.push('/api/upload');
}

// -------------------------------

// Health check endpoint
// Ruta base de prueba
app.get('/', (req, res) => {
  res.send(`Backend Veterinario funcionando correctamente en puerto ${PORT}`);
});

// 7. Arrancar el Servidor
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`✅ SERVIDOR CORRIENDO EN EL PUERTO ${PORT}`);
  console.log(`🔗 API Base:    http://localhost:${PORT}/api`);
  console.log(`🔗 Auth:        http://localhost:${PORT}/api/auth`);
  console.log(`📂 Imágenes:    http://localhost:${PORT}/uploads`);
  console.log(`==================================================\n`);
});