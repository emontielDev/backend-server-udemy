// Requires, importación de librerias que se declara cuando se utilizan algunos componente.
var express = require('express');
// Inicializar variables
var app = express();

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;