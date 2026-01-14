const db = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    // Consultamos todas las tablas catálogo definidas en tu DDL
    const [especies, colores, pelos, patrones, comportamientos] = await Promise.all([
      db.query('SELECT * FROM especies ORDER BY nombre'),
      db.query('SELECT * FROM colores ORDER BY nombre'),
      db.query('SELECT * FROM tipos_pelo ORDER BY nombre'),
      db.query('SELECT * FROM patrones_pelo ORDER BY nombre'),
      db.query('SELECT * FROM comportamientos ORDER BY nombre')
    ]);

    res.json({
      especies: especies.rows,
      colores: colores.rows,
      tipos_pelo: pelos.rows,
      patrones: patrones.rows,
      comportamientos: comportamientos.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error cargando catálogos' });
  }
};

// Obtener razas filtradas por especie
exports.getRazas = async (req, res) => {
  const { especie_id } = req.params;
  try {
    const result = await db.query('SELECT * FROM razas WHERE especie_id = $1 ORDER BY nombre', [especie_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo razas' });
  }
};