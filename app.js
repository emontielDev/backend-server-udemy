// Requires, importación de librerias que se declara cuando se utilizan algunos componente.
var express = require('express');
// Libreria de conexion a la base de datos
var mongoose = require('mongoose');

// Libreria para facilitar la impresion en consola de colores.
var colors = require('colors');

// Inicializar variables
var app = express();

//Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos ' + 'online'.bgCyan.white)
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server puerto 3000: ' + 'online'.bgCyan.white);
});