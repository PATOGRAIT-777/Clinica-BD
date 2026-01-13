const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      role = 'cliente', usr, nombre, apellidos, curp, rfc,
      email, telefono, telefono2, calle_num, num_int,
      estado, municipio, colonia, cp,
      id_type, id_number, fecha_nacimiento, genero
    } = body;

    if (!email || !body.password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Verificar si el correo ya existe
    const exists = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Guardar archivos si vienen
    let proofAddressId = null;
    let proofIdId = null;

    if (req.files && req.files.proof_address && req.files.proof_address[0]) {
      const f = req.files.proof_address[0];
      const url = `/uploads/${f.filename}`;
      const r = await db.query(
        'INSERT INTO archivos (url, nombre_archivo, mime, tamano) VALUES ($1,$2,$3,$4) RETURNING id',
        [url, f.originalname, f.mimetype, f.size]
      );
      proofAddressId = r.rows[0].id;
    }

    if (req.files && req.files.proof_id && req.files.proof_id[0]) {
      const f = req.files.proof_id[0];
      const url = `/uploads/${f.filename}`;
      const r = await db.query(
        'INSERT INTO archivos (url, nombre_archivo, mime, tamano) VALUES ($1,$2,$3,$4) RETURNING id',
        [url, f.originalname, f.mimetype, f.size]
      );
      proofIdId = r.rows[0].id;
    }

    // Buscar ubicacion_id en mx_divisiones
    let ubicacionId = null;
    if (estado && municipio && colonia) {
      const u = await db.query(
        'SELECT id FROM mx_divisiones WHERE estado = $1 AND municipio = $2 AND colonia = $3 LIMIT 1',
        [estado, municipio, colonia]
      );
      if (u.rows.length > 0) ubicacionId = u.rows[0].id;
    }

    const nombre_completo = ((nombre || '') + ' ' + (apellidos || '')).trim() || usr || email;

    const insertQ = `
      INSERT INTO usuarios
      (email, password_hash, rol, nombre_completo, telefono, telefono_secundario, calle, num_exterior, num_interior, ubicacion_id, id_type, id_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, email, rol, nombre_completo
    `;

    const vals = [
      email, passwordHash, role, nombre_completo, telefono || null, telefono2 || null,
      calle_num || null, null, num_int || null, ubicacionId, id_type || null, id_number || null
    ];

    const result = await db.query(insertQ, vals);
    const user = result.rows[0];

    // Asociar archivos a usuario (proofs) - update usuario set proof_address_id, proof_id_id
    if (proofAddressId || proofIdId) {
      const updates = [];
      const params = [];
      let idx = 1;
      if (proofAddressId) { updates.push(`proof_address_id = $${idx++}`); params.push(proofAddressId); }
      if (proofIdId) { updates.push(`proof_id_id = $${idx++}`); params.push(proofIdId); }
      params.push(user.id);
      await db.query(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${idx}`, params);
    }

    // Generar token al registrar para que el frontend pueda iniciar sesión automático
    const token = jwt.sign({ userId: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ message: 'Usuario registrado correctamente', user, token });

  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ message: 'Error interno al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const q = await db.query('SELECT id, email, password_hash, rol, nombre_completo FROM usuarios WHERE email = $1', [email]);
    if (q.rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = q.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

    // Devolver usuario sin password
    const safeUser = { id: user.id, email: user.email, rol: user.rol, nombre_completo: user.nombre_completo };
    res.json({ token, user: safeUser });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno en login' });
  }
};
