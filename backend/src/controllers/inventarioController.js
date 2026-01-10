const db = require('../config/database');

const getProducts = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addInventory = async (req, res) => {
    const { producto_id, cantidad } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE productos SET stock = stock + $1 WHERE id = $2 RETURNING *',
            [cantidad, producto_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProducts,
    addInventory,
};

