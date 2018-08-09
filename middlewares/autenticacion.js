var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Verificar token
exports.verificaToken = (req, res, next) => {
    var token = req.headers['x-authentication-token'];
    // console.log(req.headers);
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

// Verificar que sea un administrador
exports.verificaAdminRole = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Acción no permitida',
            errors: ['Su usuario no cuenta con los permisos suficientes']
        });
    }
}

// Verificar que se aun administrador o mismo usuario
exports.verificaAdminRoleOrUser = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id || '';

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Acción no permitida',
            errors: ['Su usuario no cuenta con los permisos suficientes.']
        });
    }
}