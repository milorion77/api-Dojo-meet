const jwt = require('jwt-simple');
const moment = require("moment");

//Clave secretoski
const secret_key = "mi_clave_super_secretoski";

//Crear una funcion para generear tokens
const createToken = (usuario) => {
    const payload = {
        id: usuario._id,
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        nick: usuario.nick,
        email: usuario.email,
        role: usuario.role,
        image: usuario.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix() 
  //es para determinar el momento en el que estoy creando el payload y por eso necesitamos el moment para gestionar esa fecha, y unix es un monton de numeros
  // fecha de expiracion del token, que en este momento es de 30 dias y queda en formato unix
    };

    //devolver el jwt token codificado
    return jwt.encode(payload, secret_key);
}

module.exports = {
    secret_key,
    createToken
}