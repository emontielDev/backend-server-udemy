// Requires, importación de librerias que se declara cuando se utilizan algunos componente.
var express = require('express');
// Libreria de conexion a la base de datos
var mongoose = require('mongoose');
// Libreria para parsear el body del request
var bodyParser = require('body-parser');
// Libreria para facilitar la impresion en consola de colores.
var colors = require('colors');


// Inicializar variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos ' + 'online'.bgCyan.white)
});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server puerto 3000: ' + 'online'.bgCyan.white);
});