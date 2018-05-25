var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

//Obtener todos los hospitales
app.get('/', (req, res) => {
    var offset = req.query.offset || 0;
    offset = Number(offset);

    Hospital.find({}, 'nombre img usuario')
        .populate('usuario', 'nombre email')
        .limit(5)
        .skip(offset)
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                });
            });
});

//Crear hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: null,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalCreado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalCreado
        });
    });
});

//Actualizar un hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndUpdate(id, body, (err, hospitalActualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if (!hospitalActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalActualizado
        });
    });
});

// Borrar un hoispital por id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        };

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;