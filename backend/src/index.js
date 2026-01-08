const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './backend/.env' });

const authRoutes = require('./routes/auth');
const sucursalRoutes = require('./routes/sucursales');
const mascotaRoutes = require('./routes/mascotas');
const citaRoutes = require('./routes/citas');
const visitaRoutes = require('./routes/visitas');
const razaRoutes = require('./routes/razas');

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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
