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

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, precio, stock, categoria, imagen_url]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5, imagen_url = $6 WHERE id = $7 RETURNING *',
            [nombre, descripcion, precio, stock, categoria, imagen_url, id]
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

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM productos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

