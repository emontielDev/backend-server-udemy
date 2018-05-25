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
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Importar rutas
var appRoutes = require('./routes/app');
var hospitalRoutes = require('./routes/hospital');
var usuarioRoutes = require('./routes/usuario');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/upload');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos ' + 'online'.bgCyan.white)
});

// Server Index Config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/img', imagenesRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server puerto 3000: ' + 'online'.bgCyan.white);
});