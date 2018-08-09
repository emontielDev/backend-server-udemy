var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/:coleccion/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var coleccion = req.params.coleccion.toLowerCase() || '';
    var regex = new RegExp(busqueda, 'i');

    var promise;

    switch (coleccion) {
        case 'todo':
            Promise.all([
                    buscarHospitales(busqueda, regex),
                    buscarMedicos(busqueda, regex),
                    buscarUsuario(busqueda, regex)
                ])
                .then(response => {
                    res.status(200).json({
                        ok: true,
                        hospitales: response[0],
                        medicos: response[1],
                        usuarios: response[2]
                    });
                });
            break;
        case 'usuarios':
            promise = buscarUsuario(busqueda, regex);
            break;
        case 'medicos':
            promise = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promise = buscarHospitales(busqueda, regex)
            break;
        default:
            res.status(400).json({
                ok: false,
                message: 'La colección ' + coleccion + ' no existe.'
            });
            break;
    }
    if (promise) {
        promise
            .then((usuarios) => {
                res.status(200).json({
                    ok: true,
                    [coleccion]: usuarios
                });
            })
            .catch((err) => {
                res.status(500).json({
                    ok: false,
                    error: err
                });
            });
    }
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err)
                    reject('Error al cargar hospitales', err);
                else
                    resolve(hospitales);
            });
    });

}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err)
                    reject('Error al cargar medicos', err);
                else
                    resolve(medicos);
            });
    });

}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role google img')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err)
                    reject('Error al cargar usuarios', err);
                else
                    resolve(usuarios);
            })
    });

}


module.exports = app;