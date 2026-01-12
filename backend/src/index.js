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

// 5. Importación de Rutas (Endpoints)
// NOTA: Asegúrate de que estos archivos existan en la carpeta 'routes/'
const authRoutes = require('./routes/auth');
const sucursalRoutes = require('./routes/sucursales');
const mascotaRoutes = require('./routes/mascotas');
const citaRoutes = require('./routes/citas');
const visitaRoutes = require('./routes/visitas');
const razaRoutes = require('./routes/razas');
// const doctoresRoutes = require('./routes/doctores'); // Descomentar cuando lo crees

// 6. Definición de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/razas', razaRoutes);

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