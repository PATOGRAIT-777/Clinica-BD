const { query } = require('../config/database');

const getMxDivisions = (req, res) => {
    try {
        const result = await query('SELECT * FROM mx_divisiones');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching MX divisions from DB:', error);
        res.status(500).json({ message: 'Error del servidor al obtener divisiones de México.' });
    }
};

module.exports = {
    getMxDivisions,
};

