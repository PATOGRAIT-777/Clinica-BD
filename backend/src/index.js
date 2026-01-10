const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- IMPORTANTE: Necesitamos esto para las rutas

// 1. CORRECCIÓN: Usamos path.join para encontrar el .env correctamente
//    Esto sube un nivel (..) desde 'src' para encontrar 'backend/.env'
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Importación de rutas
const authRoutes = require('./routes/auth');
const sucursalRoutes = require('./routes/sucursales');
const mascotaRoutes = require('./routes/mascotas');
const citaRoutes = require('./routes/citas');
const visitaRoutes = require('./routes/visitas');
const razaRoutes = require('./routes/razas');
// Agrega aquí las que falten si tienes más (ej. doctores, productos...)

const app = express();

app.use(cors());
app.use(express.json());

// 2. IMPORTANTE: Servir la carpeta 'uploads' para que se vean las fotos de las identificaciones
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('Backend server is running correctly.');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/razas', razaRoutes);

// Configuración del puerto (Se queda en 5000 como lo tenías)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  console.log(`   - API Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Imágenes: http://localhost:${PORT}/uploads`);
});