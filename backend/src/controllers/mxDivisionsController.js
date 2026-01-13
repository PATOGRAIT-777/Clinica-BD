const db = require('../config/database');

// Obtener todos los estados
exports.getStates = async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT estado FROM mx_divisiones ORDER BY estado');
    res.json(result.rows.map(row => row.estado));
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ message: 'Error fetching states' });
  }
};

// Obtener municipios por estado
exports.getMunicipalitiesByState = async (req, res) => {
  const { estado } = req.params;
  try {
    const result = await db.query(
      'SELECT DISTINCT municipio FROM mx_divisiones WHERE estado = $1 ORDER BY municipio',
      [estado]
    );
    res.json(result.rows.map(row => row.municipio));
  } catch (err) {
    console.error('Error fetching municipalities:', err);
    res.status(500).json({ message: 'Error fetching municipalities' });
  }
};

// Obtener colonias por municipio y estado
exports.getColoniasByMunicipalityAndState = async (req, res) => {
  const { estado, municipio } = req.params;
  try {
    const result = await db.query(
      'SELECT DISTINCT colonia, codigo_postal FROM mx_divisiones WHERE estado = $1 AND municipio = $2 ORDER BY colonia',
      [estado, municipio]
    );
    res.json(result.rows); // Returns [{ colonia: "...", codigo_postal: "..." }]
  } catch (err) {
    console.error('Error fetching colonias:', err);
    res.status(500).json({ message: 'Error fetching colonias' });
  }
};

// Obtener información de la división por CP
exports.getDivisionByCP = async (req, res) => {
    const { cp } = req.params;
    try {
        const result = await db.query(
            'SELECT estado, municipio, colonia, codigo_postal FROM mx_divisiones WHERE codigo_postal = $1 ORDER BY estado, municipio, colonia',
            [cp]
        );
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: 'No division found for this CP' });
        }
    } catch (err) {
        console.error('Error fetching division by CP:', err);
        res.status(500).json({ message: 'Error fetching division by CP' });
    }
};