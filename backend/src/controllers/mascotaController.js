const db = require('../config/database');

const mascotaFields = 'id, propietario_id, ruac, nombre, tipo, raza, fecha_nacimiento, sexo, peso, esterilizado, microchip, comportamiento, condiciones_cronicas, alergias, medicamentos, imagen_url';

// @desc    Crear una nueva mascota
// @route   POST /api/mascotas
// @access  Private (Cliente, Recepcionista, Admin)
const createMascota = async (req, res) => {
    // Un cliente solo puede crear mascotas para si mismo.
    // Un recepcionista/admin puede asignar la mascota a otro propietario_id.
    const { propietario_id, nombre, tipo, raza, fecha_nacimiento, sexo } = req.body;
    const { id: requesterId, rol: requesterRol } = req.user;

    let ownerId = requesterId;
    if ((requesterRol === 'admin' || requesterRol === 'recepcionista') && propietario_id) {
        ownerId = propietario_id;
    }

    if (!nombre || !tipo || !raza || !fecha_nacimiento || !sexo) {
        return res.status(400).json({ message: 'Nombre, tipo, raza, fecha de nacimiento y sexo son requeridos.' });
    }

    try {
        const { rows } = await db.query(
            `INSERT INTO mascotas (propietario_id, nombre, tipo, raza, fecha_nacimiento, sexo)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${mascotaFields}`,
            [ownerId, nombre, tipo, raza, fecha_nacimiento, sexo]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear mascota:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};


// @desc    Obtener mascotas
// @route   GET /api/mascotas
// @access  Private
const getMascotas = async (req, res) => {
    const { id: requesterId, rol: requesterRol } = req.user;

    try {
        let query;
        const queryParams = [];

        if (requesterRol === 'cliente') {
            // Clientes solo ven sus mascotas
            query = `SELECT ${mascotaFields} FROM mascotas WHERE propietario_id = $1 ORDER BY nombre ASC`;
            queryParams.push(requesterId);
        } else {
            // Admin, Medico, Recepcionista ven todas las mascotas
            query = `SELECT ${mascotaFields} FROM mascotas ORDER BY nombre ASC`;
        }
        
        const { rows } = await db.query(query, queryParams);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Obtener una mascota por ID
// @route   GET /api/mascotas/:id
// @access  Private
const getMascotaById = async (req, res) => {
    const { id: mascotaId } = req.params;
    const { id: requesterId, rol: requesterRol } = req.user;
    
    try {
        const { rows } = await db.query(`SELECT ${mascotaFields} FROM mascotas WHERE id = $1`, [mascotaId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }

        const mascota = rows[0];
        // Cliente solo puede ver su propia mascota
        if (requesterRol === 'cliente' && mascota.propietario_id !== requesterId) {
            return res.status(403).json({ message: 'Acceso denegado. No eres el propietario de esta mascota.' });
        }
        
        res.status(200).json(mascota);
    } catch (error) {
        console.error(`Error al obtener mascota ${mascotaId}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Actualizar una mascota
// @route   PUT /api/mascotas/:id
// @access  Private (Propietario, Recepcionista, Admin)
const updateMascota = async (req, res) => {
    const { id: mascotaId } = req.params;
    const { id: requesterId, rol: requesterRol } = req.user;
    const { nombre, tipo, raza, fecha_nacimiento, sexo, peso, esterilizado, microchip, comportamiento, condiciones_cronicas, alergias, medicamentos } = req.body;

    try {
        const { rows: mascotaRows } = await db.query('SELECT propietario_id FROM mascotas WHERE id = $1', [mascotaId]);
        if (mascotaRows.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }

        const mascota = mascotaRows[0];
        if (requesterRol === 'cliente' && mascota.propietario_id !== requesterId) {
            return res.status(403).json({ message: 'Acceso denegado. No puedes modificar una mascota que no es tuya.' });
        }

        const { rows } = await db.query(
            `UPDATE mascotas SET 
                nombre = $1, tipo = $2, raza = $3, fecha_nacimiento = $4, sexo = $5, peso = $6, esterilizado = $7, microchip = $8,
                comportamiento = $9, condiciones_cronicas = $10, alergias = $11, medicamentos = $12, actualizado_en = now()
             WHERE id = $13 RETURNING ${mascotaFields}`,
            [nombre, tipo, raza, fecha_nacimiento, sexo, peso, esterilizado, microchip, comportamiento, condiciones_cronicas, alergias, medicamentos, mascotaId]
        );
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error al actualizar mascota ${mascotaId}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};


// @desc    Eliminar una mascota
// @route   DELETE /api/mascotas/:id
// @access  Private (Admin, Recepcionista)
const deleteMascota = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM mascotas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }
        res.status(200).json({ message: 'Mascota eliminada correctamente.' });
    } catch (error) {
        console.error(`Error al eliminar mascota ${id}:`, error);
        // Podria fallar por foreign key constraints (citas, visitas)
        res.status(500).json({ message: 'Error del servidor. Asegúrese de que la mascota no tenga citas o visitas asociadas.' });
    }
};


module.exports = {
    createMascota,
    getMascotas,
    getMascotaById,
    updateMascota,
    deleteMascota,
};
