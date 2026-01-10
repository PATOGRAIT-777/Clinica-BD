const db = require('../config/database');

const getOrders = async (req, res) => {
    const { id: requesterId, rol: requesterRol } = req.user;
    let query;
    const params = [];

    if (requesterRol === 'cliente') {
        query = 'SELECT * FROM ordenes WHERE usuario_id = $1';
        params.push(requesterId);
    } else {
        query = 'SELECT * FROM ordenes';
    }

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    const { id: requesterId, rol: requesterRol } = req.user;
    try {
        const { rows } = await db.query('SELECT * FROM ordenes WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = rows[0];
        if (requesterRol === 'cliente' && order.usuario_id !== requesterId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createOrder = async (req, res) => {
    const { id: usuario_id } = req.user;
    const { total, items } = req.body; // items is expected to be a JSON array of { producto_id, cantidad, precio }
    try {
        // This should be a transaction
        await db.query('BEGIN');
        const { rows } = await db.query(
            'INSERT INTO ordenes (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING *',
            [usuario_id, total, 'pendiente']
        );
        const order = rows[0];
        const orderItemsQueries = items.map(item => {
            return db.query(
                'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
                [order.id, item.producto_id, item.cantidad, item.precio]
            );
        });
        await Promise.all(orderItemsQueries);
        await db.query('COMMIT');
        res.status(201).json(order);
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE ordenes SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
};

