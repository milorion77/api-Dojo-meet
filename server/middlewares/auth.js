//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../config/jwt.config");
const secret_key = libjwt.secret_key;

// Asi funciona un middleware de autentificacion, esto es una funcion que se ejecuta en medio de las rutas o en lo que necesitemos
exports.auth = (req, res, next) => {

    //comprobar si me llega la cabecera de autentificacion
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "la peticion no tiene headers de autentificacion"
        });
    }

    // Esto limpia el token
    let token = req.headers.authorization.replace(/['"]+/g, ''); // me quita la comilla simple y la comilla doble, y los cambiamos por un valor vacio

    //decodificar el token
    try {
        let payload = jwt.decode(token, secret_key);

        //comprobar expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
            });
        }
        //agregar datos de ususario a request
        req.usuario = payload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        });
    }

    //pasar a ejecucion de accion
    next();
}

