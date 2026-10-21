// Validar usuario Google
exports.validarGoogle = (req, res) => {

    const { email } = req.body;

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
                console.error(err);
                return res.status(500).send(err);
            }

            if (results.length === 0) {

                return res.status(401).json({
                    autorizado: false
                });

            }

            return res.json({
                autorizado: true,
                usuario: results[0]
            });

        }
    );

};