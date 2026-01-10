const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './backend/.env' });

const authRoutes = require('./routes/auth');
const sucursalRoutes = require('./routes/sucursales');
const mascotaRoutes = require('./routes/mascotas');
const citaRoutes = require('./routes/citas');
const visitaRoutes = require('./routes/visitas');
const razaRoutes = require('./routes/razas');
const userRoutes = require('./routes/usuarios');
const doctorRoutes = require('./routes/doctores');
const mxDivisionesRoutes = require('./routes/mx_divisiones');
const productoRoutes = require('./routes/productos');
const ordenRoutes = require('./routes/ordenes');
const inventarioRoutes = require('./routes/inventario');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/razas', razaRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/doctores', doctorRoutes);
app.use('/api/mx_divisiones', mxDivisionesRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/inventario', inventarioRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
