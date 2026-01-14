const db = require('../config/database');

exports.registerPet = async (req, res) => {
  try {
    const body = req.body;
    
    // 1. Guardar Archivos (Foto y Carnet)
    // Usamos esta función helper para no repetir código
    const saveFile = async (fileObj) => {
        if (!fileObj) return null;
        const f = fileObj;
        const url = `/uploads/${f.filename}`;
        // Insertar en tabla 'archivos' según tu DDL
        const r = await db.query(
            'INSERT INTO archivos (url, nombre_archivo, mime, tamano) VALUES ($1,$2,$3,$4) RETURNING id', 
            [url, f.originalname, f.mimetype, f.size]
        );
        return r.rows[0].id;
    };

    const files = req.files || {};
    const fotoPerfilId = await saveFile(files.foto ? files.foto[0] : null);
    const carnetId = await saveFile(files.carnet ? files.carnet[0] : null);

    // 2. Insertar Mascota
    // Solo usamos las columnas que EXISTEN en tu ddl_postgres.sql
    const query = `
      INSERT INTO mascotas (
        propietario_id, 
        nombre, 
        raza_id, 
        color_id, 
        tipo_pelo_id, 
        patron_pelo_id, 
        comportamiento_id, 
        fecha_nacimiento, 
        sexo, 
        peso, 
        esterilizado, 
        ruac, 
        microchip, 
        tatuaje, 
        observaciones, 
        foto_perfil_id, 
        carnet_vacunacion_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;

    const values = [
      body.propietario_id,
      body.nombre,
      body.raza_id || null,           // FK
      body.color_id || null,          // FK
      body.tipo_pelo_id || null,      // FK
      body.patron_pelo_id || null,    // FK
      body.comportamiento_id || null, // FK
      body.fecha_nacimiento || null,
      body.sexo,                      // 'Macho' o 'Hembra'
      body.peso || null,
      body.esterilizado === 'true' || body.esterilizado === 'on', // Boolean
      body.ruac,
      body.microchip,
      body.tatuaje,
      body.observaciones,
      fotoPerfilId,
      carnetId
    ];

    await db.query(query, values);
    
    res.status(201).json({ success: true, message: 'Mascota registrada correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error en BD: ' + err.message });
  }
};