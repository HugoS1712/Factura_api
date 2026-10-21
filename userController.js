const db = require('./database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Obtener todos los usuarios
exports.getUsuarios = (req, res) => {

    const query = 'SELECT * FROM usuarios';

    db.query(query, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

};

// Crear usuario
exports.addUsuario = (req, res) => {

    const {
        username,
        email,
        password,
        rol
    } = req.body;

    const token =
        crypto.randomBytes(32).toString('hex');

    const query = `
        INSERT INTO usuarios
        (
            username,
            email,
            password,
            rol,
            activo,
            token_activacion
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            username,
            email,
            password || '',
            rol || 'Usuario',
            0,
            token
        ],
        async (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            try {

                const enlace =
                    `${process.env.FRONTEND_URL}/activar/${token}`;

                await transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Activación de cuenta',
                    html: `
                        <h2>Bienvenido ${username}</h2>

                        <p>Su cuenta fue creada correctamente.</p>

                        <p>
                            Haga clic en el siguiente enlace para crear su contraseña:
                        </p>

                        <p>
                            <a href="${enlace}">
                                Crear contraseña
                            </a>
                        </p>

                        <p>
                            Si el botón no funciona copie este enlace:
                        </p>

                        <p>
                            ${enlace}
                        </p>
                    `
                });

                res.json({
                    id: results.insertId,
                    username,
                    email,
                    rol,
                    activo: false,
                    token_activacion: token,
                    mensaje: 'Usuario creado y correo enviado'
                });

            } catch (error) {

                console.error(
                    'Error enviando correo:',
                    error
                );

                res.status(500).json({
                    mensaje:
                        'Usuario creado pero no se pudo enviar el correo',
                    error: error.message
                });

            }

        }
    );

};

// Actualizar usuario
exports.updateUsuario = (req, res) => {

    const id = req.params.id;

    const {
        username,
        email,
        rol
    } = req.body;

    const query = `
        UPDATE usuarios
        SET
            username = ?,
            email = ?,
            rol = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [
            username,
            email,
            rol,
            id
        ],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json({
                mensaje: 'Usuario actualizado'
            });

        }
    );

};

// Eliminar usuario
exports.deleteUsuario = (req, res) => {

    const id = req.params.id;

    const query =
        'DELETE FROM usuarios WHERE id = ?';

    db.query(
        query,
        [id],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json({
                mensaje: 'Usuario eliminado'
            });

        }
    );

};

// Activar cuenta
exports.activarCuenta = (req, res) => {

    const {
        token,
        password
    } = req.body;

    const query = `
        UPDATE usuarios
        SET
            password =     activo = 1,
            token_activacion = NULL
        WHERE token_activacion = ?
    `;

    db.query(
        query,
        [password, token],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            if (results.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: 'Token inválido'
                });

            }

            res.json({
                mensaje: 'Cuenta activada correctamente'
            });

        }
    );

};

// Validar usuario Google
exports.validarGoogle = (req, res) => {

    const { email } = req.body;

    console.log('Validando Google:', email);

    const query = `
        SELECT *
        FROM usuarios
        WHERE email = ?
        AND activo = 1
    `;

    db.query(
        query,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    'ERROR MYSQL:',
                    err
                );

                return res.status(500).json({
                    fatal: true,
                    error: err.message
                });

            }

            if (!results || results.length === 0) {

                return res.status(401).json({
                    autorizado: false,
                    mensaje: 'Usuario no autorizado'
                });

            }

            return res.json({
                autorizado: true,
                usuario: results[0]
            });

        }
    );

};