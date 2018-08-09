var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: `Tipo de colección '${tipo}' no valida.`
        });
    }

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    // console.log(pathImagen);
    if (!fs.existsSync(pathImagen)) {
        pathImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    }

    res.sendFile(pathImagen);
});

module.exports = app;