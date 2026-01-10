const db = require('../config/database');

const getDoctors = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nombre, especialidad, foto_url FROM medicos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT id, nombre, especialidad, foto_url FROM medicos WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createDoctor = async (req, res) => {
    const { nombre, especialidad, foto_url, usuario_id } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO medicos (nombre, especialidad, foto_url, usuario_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre, especialidad, foto_url',
            [nombre, especialidad, foto_url, usuario_id]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad, foto_url, usuario_id } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE medicos SET nombre = $1, especialidad = $2, foto_url = $3, usuario_id = $4 WHERE id = $5 RETURNING id, nombre, especialidad, foto_url',
            [nombre, especialidad, foto_url, usuario_id, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM medicos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};

