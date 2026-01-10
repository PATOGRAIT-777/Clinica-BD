const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
    const { nombre_completo, email, password, rol, id_type, id_number, calle_num, num_int, estado, municipio, colonia, cp } = req.body;

    // Validation for required text fields
    if (!email || !password || !nombre_completo || !id_type || !id_number || !calle_num || !estado || !municipio || !colonia || !cp) {
        return res.status(400).json({ message: 'Por favor, proporcione todos los campos obligatorios.' });
    }

    const allowedRoles = ['cliente', 'medico', 'recepcionista', 'admin'];
    const userRole = rol && allowedRoles.includes(rol) ? rol : 'cliente';

    let proofAddressId = null;
    let proofIdId = null;

    try {
        const existingUser = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Handle file uploads if they exist
        if (req.files && req.files.proof_address && req.files.proof_address.length > 0) {
            const file = req.files.proof_address[0];
            const fileUrl = `/uploads/${file.filename}`; // Stored path
            const insertFile = await db.query(
                'INSERT INTO archivos (tabla_propietaria, url, nombre_archivo, mime, tamano) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                ['usuarios', fileUrl, file.originalname, file.mimetype, file.size]
            );
            proofAddressId = insertFile.rows[0].id;
        }

        if (req.files && req.files.proof_id && req.files.proof_id.length > 0) {
            const file = req.files.proof_id[0];
            const fileUrl = `/uploads/${file.filename}`; // Stored path
            const insertFile = await db.query(
                'INSERT INTO archivos (tabla_propietaria, url, nombre_archivo, mime, tamano) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                ['usuarios', fileUrl, file.originalname, file.mimetype, file.size]
            );
            proofIdId = insertFile.rows[0].id;
        }

        // Construct the direccion jsonb object
        const direccion = {
            calle_numero: calle_num,
            numero_interior: num_int || null,
            estado: estado,
            municipio: municipio,
            colonia: colonia,
            codigo_postal: cp
        };
        
        const newUser = await db.query(
            `INSERT INTO usuarios (
                nombre_completo, email, password_hash, rol,
                id_type, id_number, proof_address_id, proof_id_id, direccion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, email, rol, nombre_completo, id_type, id_number, direccion`,
            [
                nombre_completo, email, password_hash, userRole,
                id_type, id_number, proofAddressId, proofIdId, direccion
            ]
        );

        const user = newUser.rows[0];

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
                id_type: user.id_type,
                id_number: user.id_number,
                direccion: user.direccion // Include new fields in response
            }
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar el usuario.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione email y contraseña.' });
    }

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // 401 para fallo de autenticación
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
    }
};

module.exports = {
    register,
    login,
};