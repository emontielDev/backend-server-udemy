var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var mdAutenticacion = require('../middlewares/autenticacion');

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
            token: token,
            menu: getMenu(usuario.role)
        });

    });

});

app.post('/google', async(req, res) => {
    var token = req.body.token;

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
                    mensaje: "Problema de autenticación",
                    errors: [`Ya existe un usuario con el correo ${googleAuthentication.email} registrado con otro metodo de autenticación.`, ]
                });
            } else {
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    menu: getMenu(usuario.role)
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

                var token = jwt.sign({ usuario: usuarioCreado }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioCreado,
                    token: token,
                    menu: getMenu(usuarioCreado.role)
                });
            });
        }
    });
});

app.post('/refresh-token', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas

    res.status(200).json({
        ok: true,
        usuario: req.usuario,
        token: token
            // menu: getMenu(usuarioCreado.role)
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

function getMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Progress Bar', url: '/progress' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // {titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Medicos', url: '/medicos' },
                { titulo: 'Hospitales', url: '/hospitales' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' }); // unshift lo pone al principio
    }

    return menu;
}


module.exports = app;