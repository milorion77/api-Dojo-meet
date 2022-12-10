const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Nombre es obligatorio."]
    },
    lastName: {
        type: String,
        required: [true, "Apellido es obligatorio."],
    },
    bio: String,
    nick: {
        type: String,
        required: [true, "Este campo no puede estar Vacío"],
        minlength: [3, "El nick debe de tener al menos 3 caracteres"]
    },
    email: {
        type: String,
        required: [true, "E-mail es obligatorio."],
        validate: {
            validator: val => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
            message: "Ingrese un e-mail válido."
        },
        //unique: true //Unique no nos va a guardar cuando un email se repite PERO no es un validador
    },
    password: {
        type: String,
        //required: [true, "Password es obligatorio."],
        //minlength: [8, "Password debe de tener al menos 8 caracteres"]
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    } // es String porque lo que vamos a guardar es el nombre del ficgero que hemos guardado en el sistema de archivos del servidor

}, {timestamps: true, versionKey: false})

const Usuario = mongoose.model("usuario", UserSchema,"usuarios");
module.exports = Usuario;