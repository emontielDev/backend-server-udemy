var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

//Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//Login del usuario
app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcryptjs.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Generar token
        usuario.password = null;
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token
        });

    });

});

app.post('/google', async(req, res) => {
    var token = req.headers.authorization;

    var googleAuthentication = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: e
            });
        });

    Usuario.findOne({ email: googleAuthentication.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar la autenticación normal',
                    errors: e
                });
            } else {
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token
                });
            }
        } else {
            // El usuario no se encuentra registrado, debemos creearlo
            var usuario = new Usuario()

            usuario.nombre = googleAuthentication.nombre;
            usuario.email = googleAuthentication.email;
            usuario.img = googleAuthentication.img;
            usuario.password = ':)';
            usuario.google = true;

            usuario.save((err, usuarioCreado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioCreado }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioCreado,
                    token: token
                });
            });
        }
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


module.exports = app;