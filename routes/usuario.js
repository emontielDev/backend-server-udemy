// Requires, importación de librerias que se declara cuando se utilizan algunos componente.
var express = require('express');
// Inicializar variables
var bcryptjs = require('bcryptjs');

var app = express();
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {

    var offset = req.query.offset || 0;
    offset = Number(offset);

    Usuario.find({}, 'nombre email img role')
        .limit(5)
        .skip(offset)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        total: count,
                        usuarios: usuarios
                    });

                });
            });
});

// Crear nuevo usuario
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// Actualizar usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuario.password = null;
            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            });
        });
    });
});

// Borrar un usuario por id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id ' + id
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;