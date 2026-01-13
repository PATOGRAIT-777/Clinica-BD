const express = require('express');
const router = express.Router();
const pool = require('../database'); // Ajusta la ruta si tu database.js está en otra carpeta

// 1. OBTENER DATOS INICIALES (Sucursales y Servicios)
router.get('/init-data', async (req, res) => {
    try {
        const sucursales = await pool.query('SELECT id, nombre FROM sucursales');
        
        // CORRECCIÓN BASADA EN TU DDL:
        // La tabla 'servicios' tiene campo 'duracion' tipo INTERVAL.
        // Lo convertimos a minutos numéricos para que el frontend pueda calcular.
        const serviciosQuery = `
            SELECT 
                id, 
                nombre, 
                precio, 
                EXTRACT(EPOCH FROM duracion) / 60 AS duracion_minutos 
            FROM servicios
        `;
        const servicios = await pool.query(serviciosQuery);
        
        res.json({
            sucursales: sucursales.rows,
            servicios: servicios.rows
        });
    } catch (err) {
        console.error('❌ Error en init-data:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. OBTENER MIS MASCOTAS (Basado en DDL: tabla mascotas tiene usuario_id)
router.get('/mis-mascotas/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        // En tu DDL: usuario_id uuid REFERENCES usuarios(id)
        const query = 'SELECT id, nombre FROM mascotas WHERE usuario_id = $1';
        const result = await pool.query(query, [usuarioId]);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error cargando mascotas:', err.message);
        res.status(500).json([]); 
    }
});

// 3. OBTENER MÉDICOS POR SUCURSAL
router.get('/medicos/:sucursalId', async (req, res) => {
    try {
        const { sucursalId } = req.params;
        // En tu DDL: medicos tiene sucursal_id y usuario_id
        const query = `
            SELECT m.id, u.nombre_completo 
            FROM medicos m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.sucursal_id = $1
        `;
        const result = await pool.query(query, [sucursalId]);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error medicos:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. CALCULAR HORARIOS DISPONIBLES
router.get('/horarios-disponibles', async (req, res) => {
    try {
        const { medicoId, fecha } = req.query; 
        
        // Determinar día de la semana (0=Domingo, 1=Lunes...)
        // Nota: Postgres y JS pueden diferir en timezone, usaremos la fecha string directa
        const dateObj = new Date(fecha + 'T00:00:00'); 
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNumero = dateObj.getDay(); 
        
        // En tu DDL, 'medico_horarios' tiene columna 'dia_semana' (int)
        // PERO revisando DDL, dia_semana es int 0-6.
        
        // Paso A: Obtener horario base
        // CORRECCIÓN DDL: La columna es 'hora_fin', no 'hora_salida'
        const horarioQuery = `
            SELECT hora_inicio, hora_fin 
            FROM medico_horarios 
            WHERE medico_id = $1 AND dia_semana = $2
        `;
        
        const horarioBase = await pool.query(horarioQuery, [medicoId, diaNumero]);

        if (horarioBase.rows.length === 0) {
            return res.json([]); // No trabaja ese día
        }

        const { hora_inicio, hora_fin } = horarioBase.rows[0];

        // Paso B: Obtener citas ya ocupadas
        const citasQuery = `
            SELECT hora_inicio 
            FROM citas 
            WHERE medico_id = $1 AND fecha = $2 AND estado != 'cancelada'
        `;
        const citasExistentes = await pool.query(citasQuery, [medicoId, fecha]);
        
        // Convertimos a string "HH:MM" (cortando los segundos si vienen)
        const horasOcupadas = citasExistentes.rows.map(c => c.hora_inicio.substring(0, 5));

        // Paso C: Generar slots de tiempo
        let slots = [];
        let current = new Date(`2000-01-01T${hora_inicio}`);
        const end = new Date(`2000-01-01T${hora_fin}`); // Usando hora_fin correcta del DDL

        while (current < end) {
            // Formato HH:MM
            const hours = current.getHours().toString().padStart(2, '0');
            const minutes = current.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            
            // Si no está ocupado, agregar
            if (!horasOcupadas.includes(timeString)) {
                slots.push(timeString);
            }
            
            // Sumar 30 mins (Puedes hacerlo dinámico si envías la duración del servicio en el query)
            current.setMinutes(current.getMinutes() + 30);
        }

        res.json(slots);

    } catch (err) {
        console.error('❌ Error horarios:', err.message);
        res.status(500).json({ error: 'Error calculando horarios' });
    }
});

// 5. AGENDAR CITA
router.post('/agendar', async (req, res) => {
    try {
        const { mascota_id, sucursal_id, servicio_id, medico_id, fecha, hora_inicio } = req.body;
        
        // Validar datos mínimos
        if (!mascota_id || !medico_id || !fecha || !hora_inicio) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Insertar cita (Segun DDL: id es default, estado default 'pendiente' o lo forzamos)
        const query = `
            INSERT INTO citas (mascota_id, sucursal_id, servicio_id, medico_id, fecha, hora_inicio, estado)
            VALUES ($1, $2, $3, $4, $5, $6, 'confirmada')
            RETURNING id
        `;
        
        const result = await pool.query(query, [mascota_id, sucursal_id, servicio_id, medico_id, fecha, hora_inicio]);
        
        res.json({ success: true, citaId: result.rows[0].id });
        
    } catch (err) {
        console.error('❌ Error al agendar:', err.message);
        res.status(500).json({ error: 'Error al agendar cita: ' + err.message });
    }
});

module.exports = router;