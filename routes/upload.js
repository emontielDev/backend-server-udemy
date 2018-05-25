var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var id = req.params.id;
    var tipo = req.params.tipo;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: `Tipo de colección '${tipo}' no valida.`
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha seleccionado imagen.'
        });
    }

    var archivo = req.files.imagen;
    var extension = archivo.name.split('.').pop();

    // Filtro extensiones permitidas
    var extensiones = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensiones.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { mensaje: 'Las extensiones validas son: ' + extensiones.join(', ') }
        });
    }

    // Nombre archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    // Copiar archivo
    var ruta = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(ruta, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Error al subir el archivo`,
                error: err
            });
        }
        subirPorTipo(tipo, id, ruta, res);
        //subirPorColeccion(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true
        // });
    });

});

function subirPorTipo(tipo, id, path, res) {
    var tipoColeccion;
    switch (tipo) {
        case 'hospitales':
            tipoColeccion = Hospital;
            break;
        case 'medicos':
            tipoColeccion = Medico;
            break;
        case 'usuarios':
            tipoColeccion = Usuario;
            break;
        default:
            return;
    }
    tipoColeccion.findById(id, 'nombre img')
        .exec(
            (err, resultado) => {
                if (!resultado) {
                    fs.unlinkSync(path); // Borro el archivo cuando no tengo id valido
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se encontro nada con ese Id',
                        errors: { message: 'Debe selecionar un Id valido' }
                    });
                } else {
                    var split = path.split('/');
                    var pathViejo = `${split.slice(0, split.length - 1).join('/')}/${resultado.img}`;
                    //console.log(split.pop());
                    // Si existe, Elimino la imagen vieja
                    if (fs.existsSync(pathViejo)) {
                        fs.unlinkSync(pathViejo);
                    }
                    resultado.img = split.pop();
                    resultado.save((err, resultadoActualizado) => {
                        res.status(200).json({
                            ok: true,
                            pathviejo: pathViejo,
                            [tipo]: resultado,
                            mensaje: 'Imagen de ' + tipo + ' actualizada'
                        });
                    });
                }
            });
}

function subirPorColeccion(coleccion, id, nombreArchivo, res) {
    switch (coleccion) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: `Error al buscar usuario`,
                        error: err
                    });
                }

                //Eliminamos la imagen del file system
                if (usuario.img) {
                    var rutaAnterior = './uploads/usuarios/' + usuario.img;
                    if (fs.existsSync(rutaAnterior)) {
                        fs.unlink(rutaAnterior);
                    }
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioActualizado
                    });
                });

            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: `Error al buscar medico`,
                        error: err
                    });
                }

                //Eliminamos la imagen del file system
                if (medico.img) {
                    var rutaAnterior = './uploads/medicos/' + medico.img;
                    if (fs.existsSync(rutaAnterior)) {
                        fs.unlink(rutaAnterior);
                    }
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        medico: medicoActualizado
                    });
                });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: `Error al buscar hospital`,
                        error: err
                    });
                }

                //Eliminamos la imagen del file system
                if (hospital.img) {
                    var rutaAnterior = './uploads/hospitales/' + hospital.img;
                    if (fs.existsSync(rutaAnterior)) {
                        fs.unlink(rutaAnterior);
                    }
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        hospital: hospitalActualizado
                    });
                });

            });
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: `El colección '${coleccion}' no es valida.`
            });
            break;
    }
}

module.exports = app;