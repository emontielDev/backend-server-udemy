var express = require('express');
var app = express();

var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

// Obtener la lista de medicos.
app.get('/', (req, res) => {
    var offset = req.query.offset || 0;
    offset = Number(offset);

    Medico
        .find({}, 'nombre img')
        .limit(5)
        .skip(offset)
        .populate('usuario', 'nombre email img')
        .populate('hospital', 'nombre usuario')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    total: count,
                    medicos: medicos
                });

            });
        });
});

// Obtener medico por id
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medico
        .findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital', 'nombre usuario img')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener el medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe.',
                });
            }

            return res.status(200).json({
                ok: true,
                medico
            });
        });
});

//Crear nuevo medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoCreado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoCreado
        });
    });
});

//Actualizar datos del medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndUpdate(id, body, (err, medicoActualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medicoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe.',
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoActualizado
        });
    });

});

//Eliminar un medico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        };

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id ' + id
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;