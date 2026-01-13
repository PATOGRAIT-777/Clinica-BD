const db = require('../config/database');

// Devuelve las horas YA ocupadas para un médico en una fecha
exports.getOcupadas = async (req, res) => {
  const { fecha, medicoId, sucursalId } = req.query;
  try {
    const result = await db.query(
      "SELECT to_char(hora_inicio, 'HH24:MI') as hora FROM citas WHERE fecha = $1 AND medico_id = $2 AND estado != 'cancelada'",
      [fecha, medicoId]
    );
    // Devuelve array simple: ['09:00', '10:30']
    res.json(result.rows.map(r => r.hora));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearCita = async (req, res) => {
  const { sucursal, doctor, date, time, owner, procedure } = req.body;
  try {
    // Validar disponibilidad doble check
    const ocupado = await db.query("SELECT id FROM citas WHERE fecha=$1 AND hora_inicio=$2 AND medico_id=$3", [date, time, doctor]);
    if(ocupado.rows.length > 0) return res.status(409).json({message: 'Horario ocupado'});

    // Insertar (Guardamos el dueño en 'motivo' temporalmente si no hay tabla pacientes)
    await db.query(
      "INSERT INTO citas (sucursal_id, medico_id, fecha, hora_inicio, motivo, estado) VALUES ($1, $2, $3, $4, $5, 'pendiente')",
      [sucursal, doctor, date, time, `Cliente: ${owner}. Proc: ${procedure}`]
    );
    res.json({ message: 'Cita creada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};