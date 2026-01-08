const db = require('../config/database');

const visitaFields = 'id, mascota_id, medico_id, propietario_id, atendido_en, notas, diagnostico, tratamientos, recetas';

// @desc    Crear una nueva visita (entrada de expediente)
// @route   POST /api/visitas
// @access  Private (Medico, Admin)
const createVisita = async (req, res) => {
    const { mascota_id, propietario_id, notas, diagnostico, tratamientos, recetas } = req.body;
    const { id: requesterId, rol: requesterRol } = req.user;

    if (!mascota_id) {
        return res.status(400).json({ message: 'La mascota ID es requerida.' });
    }

    try {
        // Obtenemos el ID de médico del usuario que hace la petición
        const { rows: medRows } = await db.query('SELECT id FROM medicos WHERE usuario_id = $1', [requesterId]);
        if (medRows.length === 0 && requesterRol !== 'admin') {
            return res.status(403).json({ message: 'Tu perfil de usuario no corresponde a un médico registrado.' });
        }
        // Si es un admin creando el registro, el medico_id puede ser null o venir en el body.
        // Por simplicidad, lo asignamos si es médico.
        const medico_id = medRows.length > 0 ? medRows[0].id : null;


        const { rows } = await db.query(
            `INSERT INTO visitas (mascota_id, medico_id, propietario_id, atendido_en, notas, diagnostico, tratamientos, recetas)
             VALUES ($1, $2, $3, now(), $4, $5, $6, $7) RETURNING ${visitaFields}`,
            [mascota_id, medico_id, propietario_id, notas, diagnostico, tratamientos, recetas]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear visita:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Obtener todas las visitas de una mascota
// @route   GET /api/mascotas/:mascotaId/visitas
// @access  Private (Medico, Admin, Propietario)
const getVisitasForMascota = async (req, res) => {
    const { mascotaId } = req.params;
    const { id: requesterId, rol: requesterRol } = req.user;

    try {
        // Verificar si el que pregunta es el dueño de la mascota
        if (requesterRol === 'cliente') {
            const { rows: ownerRows } = await db.query('SELECT propietario_id FROM mascotas WHERE id = $1', [mascotaId]);
            if (ownerRows.length === 0 || ownerRows[0].propietario_id !== requesterId) {
                return res.status(403).json({ message: 'No tienes permiso para ver el expediente de esta mascota.' });
            }
        }
        // Medicos y Admins pueden ver cualquier expediente.

        const { rows } = await db.query(
            `SELECT v.id, v.atendido_en, v.diagnostico, v.tratamientos, m.nombre as medico_nombre
             FROM visitas v
             LEFT JOIN medicos m ON v.medico_id = m.id
             WHERE v.mascota_id = $1
             ORDER BY v.atendido_en DESC`, [mascotaId]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error(`Error al obtener visitas para mascota ${mascotaId}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Obtener una visita por su ID
// @route   GET /api/visitas/:id
// @access  Private (Medico, Admin, Propietario)
const getVisitaById = async (req, res) => {
    const { id: visitaId } = req.params;
    const { id: requesterId, rol: requesterRol } = req.user;

    try {
        const { rows } = await db.query(`SELECT ${visitaFields} FROM visitas WHERE id = $1`, [visitaId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Visita no encontrada.' });
        }
        
        const visita = rows[0];

        if (requesterRol === 'cliente') {
            if (visita.propietario_id !== requesterId) {
                return res.status(403).json({ message: 'No tienes permiso para ver esta visita.' });
            }
        }

        res.status(200).json(visita);
    } catch (error) {
        console.error(`Error al obtener visita ${visitaId}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};


module.exports = {
    createVisita,
    getVisitasForMascota,
    getVisitaById,
};
