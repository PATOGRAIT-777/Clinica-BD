const db = require('../config/database');

const citaFields = `id, mascota_id, propietario_id, medico_id, sucursal_id, fecha, hora_inicio, estado, procedimiento`;

// @desc    Crear una nueva cita
// @route   POST /api/citas
// @access  Private (Cliente, Recepcionista, Admin)
const createCita = async (req, res) => {
    // El cliente solicita una cita para su mascota.
    // El recepcionista/admin puede crearla para cualquiera.
    const { mascota_id, medico_id, sucursal_id, fecha, hora_inicio, procedimiento } = req.body;
    const { id: requesterId, rol: requesterRol } = req.user;

    try {
        const { rows: mascotaRows } = await db.query('SELECT propietario_id FROM mascotas WHERE id = $1', [mascota_id]);
        if (mascotaRows.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }
        
        const propietario_id = mascotaRows[0].propietario_id;

        // Un cliente solo puede agendar para sus propias mascotas.
        if (requesterRol === 'cliente' && propietario_id !== requesterId) {
            return res.status(403).json({ message: 'No puedes agendar una cita para una mascota que no es tuya.' });
        }

        const { rows } = await db.query(
            `INSERT INTO citas (mascota_id, propietario_id, medico_id, sucursal_id, fecha, hora_inicio, procedimiento, creado_por)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${citaFields}`,
            [mascota_id, propietario_id, medico_id, sucursal_id, fecha, hora_inicio, procedimiento, requesterId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        // Error de unicidad (doble reserva)
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El horario seleccionado para este médico ya no está disponible.' });
        }
        console.error('Error al crear cita:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Obtener todas las citas (con filtros)
// @route   GET /api/citas
// @access  Private
const getCitas = async (req, res) => {
    const { id: requesterId, rol: requesterRol } = req.user;
    // Futuros filtros: ?fecha=YYYY-MM-DD&sucursal_id=uuid&medico_id=uuid&estado=pendiente
    const { fecha, sucursal_id, medico_id, estado } = req.query;

    try {
        let query = `SELECT c.id, c.fecha, c.hora_inicio, c.estado, c.procedimiento,
                            m.id as mascota_id, m.nombre as mascota_nombre,
                            u.id as propietario_id, u.nombre_completo as propietario_nombre,
                            med.id as medico_id, med.nombre as medico_nombre,
                            s.id as sucursal_id, s.nombre as sucursal_nombre
                     FROM citas c
                     JOIN mascotas m ON c.mascota_id = m.id
                     JOIN usuarios u ON c.propietario_id = u.id
                     LEFT JOIN medicos med ON c.medico_id = med.id
                     JOIN sucursales s ON c.sucursal_id = s.id`;
        
        const params = [];
        let whereClauses = [];

        if (requesterRol === 'cliente') {
            whereClauses.push(`c.propietario_id = $${params.length + 1}`);
            params.push(requesterId);
        } else if (requesterRol === 'medico') {
            whereClauses.push(`c.medico_id = $${params.length + 1}`);
            // A un médico se le asocia su ID de usuario, pero en la tabla citas es el id de la tabla medicos
            // Asumimos que podemos encontrar el id de medico a partir del id de usuario
            const medRows = await db.query('SELECT id FROM medicos WHERE usuario_id = $1', [requesterId]);
            if(medRows.rows.length === 0) return res.status(403).json({ message: 'Perfil de médico no encontrado para este usuario.' });
            params.push(medRows.rows[0].id);
        }

        // Aplicar filtros de query
        if (fecha) { whereClauses.push(`c.fecha = $${params.length + 1}`); params.push(fecha); }
        if (sucursal_id) { whereClauses.push(`c.sucursal_id = $${params.length + 1}`); params.push(sucursal_id); }
        if (medico_id && requesterRol !== 'medico') { whereClauses.push(`c.medico_id = $${params.length + 1}`); params.push(medico_id); }
        if (estado) { whereClauses.push(`c.estado = $${params.length + 1}`); params.push(estado); }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
        
        query += ' ORDER BY c.fecha, c.hora_inicio ASC';

        const { rows } = await db.query(query, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Actualizar el estado de una cita
// @route   PUT /api/citas/:id/estado
// @access  Private
const updateCitaEstado = async (req, res) => {
    const { id: citaId } = req.params;
    const { estado } = req.body;
    const { id: requesterId, rol: requesterRol } = req.user;

    const allowedStatus = ['confirmada', 'cancelada', 'completada'];
    if (!estado || !allowedStatus.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido.' });
    }

    try {
        const { rows: citaRows } = await db.query('SELECT propietario_id, medico_id, estado as estado_actual FROM citas WHERE id = $1', [citaId]);
        if (citaRows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        const cita = citaRows[0];

        // Lógica de permisos
        if (requesterRol === 'cliente') {
            if (cita.propietario_id !== requesterId || estado !== 'cancelada') {
                return res.status(403).json({ message: 'Como cliente, solo puedes cancelar tus propias citas.' });
            }
        } else if (requesterRol === 'medico') {
            const {rows: medRows} = await db.query('SELECT id FROM medicos WHERE usuario_id = $1', [requesterId]);
            if(medRows.rows.length === 0 || medRows.rows[0].id !== cita.medico_id) {
                 return res.status(403).json({ message: 'No puedes modificar una cita que no te corresponde.' });
            }
            if (estado !== 'completada') {
                return res.status(403).json({ message: 'Como médico, solo puedes marcar una cita como completada.' });
            }
        } // Recepcionista y Admin tienen más permisos, pueden cambiar a 'confirmada' o 'cancelada'

        const { rows } = await db.query(
            `UPDATE citas SET estado = $1, actualizado_en = now() WHERE id = $2 RETURNING ${citaFields}`,
            [estado, citaId]
        );
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(`Error al actualizar estado de cita ${citaId}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Eliminar una cita
// @route   DELETE /api/citas/:id
// @access  Private (Admin, Recepcionista)
const deleteCita = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM citas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        res.status(200).json({ message: 'Cita eliminada permanentemente.' });
    } catch (error) {
        console.error(`Error al eliminar cita ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};


module.exports = {
    createCita,
    getCitas,
    updateCitaEstado,
    deleteCita,
};
