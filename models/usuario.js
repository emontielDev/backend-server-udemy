var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Scheme = mongoose.Schema;

var roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioScheme = new Scheme({
    nombre: { type: String, required: [true, 'El nombre es necesario.'] },
    email: { type: String, unique: true, required: [true, 'El correo electrónico es necesario.'] },
    password: { type: String, required: [true, 'La contraseña es necesaria.'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: "USER_ROLE", enum: roles },
});

usuarioScheme.plugin(uniqueValidator, { message: 'El {PATH} debe de ser unico.' });

module.exports = mongoose.model('Usuario', usuarioScheme);