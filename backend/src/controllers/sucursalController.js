const db = require('../config/database');

// @desc    Obtener todas las sucursales
// @route   GET /api/sucursales
// @access  Public
const getSucursales = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nombre, direccion, telefono FROM sucursales ORDER BY nombre ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Obtener una sucursal por ID
// @route   GET /api/sucursales/:id
// @access  Public
const getSucursalById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT id, nombre, direccion, telefono FROM sucursales WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error al obtener sucursal ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// @desc    Crear una nueva sucursal
// @route   POST /api/sucursales
// @access  Private/Admin
const createSucursal = async (req, res) => {
    // La direccion debe ser un objeto JSON, ej: {"calle": "Av. Siempreviva 742", "ciudad": "Springfield"}
    const { nombre, direccion, telefono } = req.body;

    if (!nombre || !direccion) {
        return res.status(400).json({ message: 'Por favor, proporcione al menos un nombre y una dirección.' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO sucursales (nombre, direccion, telefono) VALUES ($1, $2, $3) RETURNING *',
            [nombre, direccion, telefono]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear la sucursal:', error);
        res.status(500).json({ message: 'Error del servidor al crear la sucursal.' });
    }
};

// @desc    Actualizar una sucursal
// @route   PUT /api/sucursales/:id
// @access  Private/Admin
const updateSucursal = async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, telefono } = req.body;

    if (!nombre || !direccion) {
        return res.status(400).json({ message: 'Por favor, proporcione al menos un nombre y una dirección.' });
    }

    try {
        const { rows } = await db.query(
            'UPDATE sucursales SET nombre = $1, direccion = $2, telefono = $3, actualizado_en = now() WHERE id = $4 RETURNING *',
            [nombre, direccion, telefono, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (error)
    {
        console.error(`Error al actualizar la sucursal ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor al actualizar la sucursal.' });
    }
};

// @desc    Eliminar una sucursal
// @route   DELETE /api/sucursales/:id
// @access  Private/Admin
const deleteSucursal = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM sucursales WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }
        res.status(200).json({ message: 'Sucursal eliminada correctamente.' });
    } catch (error) {
        console.error(`Error al eliminar la sucursal ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor al eliminar la sucursal.' });
    }
};

module.exports = {
    getSucursales,
    getSucursalById,
    createSucursal,
    updateSucursal,
    deleteSucursal,
};