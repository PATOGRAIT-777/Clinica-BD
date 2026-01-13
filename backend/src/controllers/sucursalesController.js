const db = require('../config/database');

exports.getSucursales = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre FROM sucursales WHERE activo = true');
    // Si la tabla está vacía, devolvemos un array vacío []
    res.json(result.rows);
  } catch (err) {
    console.error('Error en getSucursales:', err);
    res.status(500).json({ error: 'Error al obtener sucursales de la BD' });
  }
};

exports.getMedicos = async (req, res) => {
  const { sucursalId } = req.params;
  try {
    const result = await db.query(`
        SELECT m.id, u.nombre_completo as name, e.nombre as specialty
        FROM medicos m
        JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN especialidades e ON m.especialidad_principal_id = e.id
        WHERE m.sucursal_id = $1
    `, [sucursalId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en getMedicos:', err);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
};