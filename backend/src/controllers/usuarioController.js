const db = require('../config/database');

const getUsers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nombre_completo, email, rol FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT id, nombre_completo, email, rol FROM usuarios WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, rol } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre_completo, email, rol',
            [nombre_completo, email, rol, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};

