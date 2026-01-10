const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Asegúrate que apunte a tu database.js que exporta { pool }

const register = async (req, res) => {
    // Obtenemos una conexión individual para poder usar BEGIN/COMMIT (Transacción)
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN'); // --- INICIO DE TRANSACCIÓN ---

        const {
            usr, nombre, apellidos, curp, rfc, email, telefono, telefono2,
            calle_num, num_int, estado, municipio, colonia, cp,
            id_type, id_number, password, fecha_nacimiento, genero
        } = req.body;

        const files = req.files;

        // Validaciones básicas
        if (!email || !password || !nombre) {
             throw new Error('Faltan datos obligatorios (Email, Password, Nombre)');
        }

        // 1. Verificar si ya existe
        const checkUser = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // 2. Preparar datos del usuario
        const nombre_completo = `${nombre} ${apellidos}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Armamos los JSONs (segun vi en tu base de datos usas columnas JSON)
        const direccionJson = {
            calle_num, num_int, estado, municipio, colonia, cp
        };
        const datosPersonalesJson = {
            usr, curp, rfc, telefono2, fecha_nacimiento, genero
        };

        // 3. INSERTAR USUARIO (Primero sin archivos)
        // Nota: Ajusta los nombres de columnas (usuario, nombre_completo, etc) si difieren en tu BD
        const insertUserQuery = `
            INSERT INTO usuarios (
                usuario, nombre_completo, email, telefono, password, rol,
                direccion, datos_personales,
                id_type, id_number
            ) VALUES ($1, $2, $3, $4, $5, 'cliente', $6, $7, $8, $9)
            RETURNING id, usuario, rol
        `;
        
        const userRes = await client.query(insertUserQuery, [
            usr, nombre_completo, email, telefono, hashedPassword,
            direccionJson, datosPersonalesJson,
            id_type, id_number
        ]);
        
        const userId = userRes.rows[0].id;
        console.log("✅ Usuario creado temporalmente con ID:", userId);

        // 4. INSERTAR ARCHIVOS (Ahora que tenemos el userId)
        let proofAddressId = null;
        let proofIdId = null;

        const insertFileQuery = `
            INSERT INTO archivos (
                tabla_propietaria, id_propietario, 
                url, nombre_archivo, mime, tamano
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;

        // Función auxiliar para insertar
        const saveFile = async (fileObj) => {
            if (!fileObj) return null;
            const resFile = await client.query(insertFileQuery, [
                'usuarios',                     // tabla_propietaria
                userId,                         // id_propietario
                `/uploads/${fileObj.filename}`, // url (ruta web)
                fileObj.originalname,           // nombre_archivo
                fileObj.mimetype,               // mime
                fileObj.size                    // tamano
            ]);
            return resFile.rows[0].id;
        };

        // Guardamos los archivos si existen
        if (files && files['proof_address']) {
            proofAddressId = await saveFile(files['proof_address'][0]);
        }
        if (files && files['proof_id']) {
            proofIdId = await saveFile(files['proof_id'][0]);
        }

        // 5. ACTUALIZAR USUARIO (Vinculamos los archivos al usuario)
        await client.query(`
            UPDATE usuarios 
            SET proof_address_id = $1, 
                proof_id_id = $2
            WHERE id = $3
        `, [proofAddressId, proofIdId, userId]);

        await client.query('COMMIT'); // --- CONFIRMAR CAMBIOS ---
        console.log("✅ Registro completado exitosamente.");

        // 6. Respuesta al cliente
        const token = jwt.sign(
            { id: userId, rol: userRes.rows[0].rol }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '8h' }
        );

        res.status(201).json({
            message: 'Usuario registrado con éxito',
            token,
            user: { id: userId, nombre: nombre_completo, email }
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Si algo falla, borra todo lo que hizo en este intento
        console.error("❌ Error en transacción:", error.message);
        res.status(500).json({ message: error.message });
    } finally {
        client.release(); // Importante: Liberar la conexión
    }
};

// Mantén tu función de login igual...
const login = async (req, res) => { /* ... tu código de login ... */ };

module.exports = { register, login };