const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// 1. Environment Configuration
// Load environment variables from .env file in the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Global Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// 4. Serve Static Files
// Serve uploaded images from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve frontend files from the 'public_html' directory
app.use(express.static(path.join(__dirname, '../../public_html')));

// 5. Dynamic Route Loading
const routesPath = path.join(__dirname, 'routes');
const mountedRoutes = [];

fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
        try {
            const route = require(path.join(routesPath, file));
            // The route name will be the filename without the .js extension
            const routeName = path.parse(file).name;
            // Mount the route at /api/<route-name>
            // e.g., auth.js -> /api/auth
            app.use(`/api/${routeName}`, route);
            mountedRoutes.push(`/api/${routeName}`);
        } catch (error) {
            console.error(`Error loading route ${file}:`, error);
        }
    }
});

// 6. Root and Health Check
app.get('/api', (req, res) => {
    res.json({
        message: `Backend Veterinario funcionando correctamente en puerto ${PORT}`,
        availableRoutes: mountedRoutes
    });
});

// Redirect root to the main admin page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public_html/admin/regUser.html'));
});

// 7. Start Server
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`✅ SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔗 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📂 Uploads:   http://localhost:${PORT}/uploads`);
    console.log('Mounted API routes:');
    mountedRoutes.forEach(route => console.log(`  - http://localhost:${PORT}${route}`));
    console.log(`==================================================\n`);
});