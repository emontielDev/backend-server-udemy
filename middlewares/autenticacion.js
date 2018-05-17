var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Verificar token
exports.verificaToken = (req, res, next) => {
    var token = req.headers.authorization;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        // Visible el usuario en cualquier peticion.
        req.usuario = decoded.usuario;

        next();
        // return res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}