const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
    const { nombre_completo, email, password, rol } = req.body;

    if (!email || !password || !nombre_completo) {
        return res.status(400).json({ message: 'Por favor, proporcione nombre, email y contraseña.' });
    }

    // Validar que el rol sea uno de los permitidos
    const allowedRoles = ['cliente', 'medico', 'recepcionista', 'admin'];
    if (rol && !allowedRoles.includes(rol)) {
        return res.status(400).json({ message: 'El rol proporcionado no es válido.' });
    }

    try {
        const existingUser = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Usar el rol proporcionado o 'cliente' por defecto
        const userRole = rol || 'cliente';

        const newUser = await db.query(
            'INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, email, rol, nombre_completo',
            [nombre_completo, email, password_hash, userRole]
        );

        const user = newUser.rows[0];

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
            expiresIn: '8h', // Extendida la sesión
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
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