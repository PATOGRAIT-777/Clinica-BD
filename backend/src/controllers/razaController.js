const db = require('../config/database');

// @desc    Obtener todas las razas agrupadas por especie
// @route   GET /api/razas
// @access  Public
const getRazas = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT especie, nombre FROM razas ORDER BY especie, nombre ASC');
        
        // Agrupar las razas por especie en un objeto
        const razasAgrupadas = rows.reduce((acc, { especie, nombre }) => {
            if (!acc[especie]) {
                acc[especie] = [];
            }
            acc[especie].push(nombre);
            return acc;
        }, {});

        res.status(200).json(razasAgrupadas);
    } catch (error) {
        console.error('Error al obtener razas:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

module.exports = {
    getRazas,
};
