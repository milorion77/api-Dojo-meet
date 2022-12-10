//Importo los modelos que necesito
const Follow = require("../models/follow.model");
const Usuario = require("../models/user.model");
const mongoosepaginate = require("mongoose-pagination");

const followConfig = require("../config/followUserIds.config");

//Prueba con Postman
module.exports.pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.controllers.js"
    });
}

//accion de guardar un follow (accion de seguir)
module.exports.guardar = (req, res) => {
    //Se consigue los datos por el body
    const params = req.body;

    //Sacar el id del usuario identificado
    const identidad = req.usuario;

    //crear objeto co modelo follow
    let usuariofollow = new Follow({
        usuario: identidad.id,
        followed: params.followed
    });
    //usuariofollow.usuario = identidad.id; //recordatorio que ese id es el id del payload del token
    //usuariofollow.followed = params.followed;

    //guardar objeto en la base de datos
    usuariofollow.save((error, followStored) => {

        if (error || !followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se pudo serguir al usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            usuarioIndentidad: req.usuario,
            follow: followStored
        });
    });
}

//accion de borrar un follow (accion de seguir)
module.exports.deletefollow = (req, res) => {
    //recoger el id del ususario identificado
    const usuarioId = req.usuario.id;

    //recoger el id del ususario que sigo y lo quiero dejar de seguir
    const followedId = req.params.id;

    //hacer un find del follow que coincida con el ususario identificado y con el id del ususario que quiero dejar de seguir
    Follow.find({
        "usuario": usuarioId, //aqui hage que usuario coincida con usuarioId
        "followed": followedId
    }).findOneAndRemove((error, followDelete) => {
        if (error || !followDelete) {
            return res.status(500).send({
                status: "error",
                message: "no se ha podido eliminar el seguido"
            });
        }
        return res.status(200).send({
            status: "success",
            message: "Follow eliminado"
        });
    })
}

//accion de listado de ususarios que cualquier ususario esta siguiendo (siguiendo)
module.exports.following = (req, res) => {
    //sacar el id del usuario identificado
    let usuarioId = req.usuario.id;

    //comprobar si me llega el id por parametro en url
    if (req.params.id) usuarioId = req.params.id;

    //comprobar si me llega la pagina,si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    //Usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    //find a follows, popular datos de los usuarios y paginar con mongoose paginate
    Follow.find({ usuario: usuarioId })
        .populate("usuario followed", "-password -role -email")
        .paginate(page, itemsPerPage, async (error, follows, total) => {
            if (error) {
                return res.status(400).send({
                    status: "error",
                    message: "No se pudo mostrar los follows"
                });
            }
            //Listado de usuarios de usuario 1, y usuario 2. Entonces crear un array para poder ver los usuarios que ellos siguen en comun
            let followUserIds = await followConfig.followUsuariosIds(req.usuario.id);
            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que estoy siguiendo",
                usuarioIniciado: usuarioId,
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                usuarios_following: followUserIds.following,
                usuarios_follow_me: followUserIds.followers
            });
        })
}

//accion de listado de ususarios que siguen a cualquier otro ususario (soy seguido, mis seguidores)
module.exports.followers = (req, res) => {

    //sacar el id del usuario identificado
    let usuarioId = req.usuario.id;

    //comprobar si me llega el id por parametro en url
    if (req.params.id) usuarioId = req.params.id;

    //comprobar si me llega la pagina,si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    //Usuarios por pagina quiero mostrar
    const itemsPerPage = 5;
    //find a follows, popular datos de los usuarios y paginar con mongoose paginate
    Follow.find({ followed: usuarioId })
        .populate("usuario", "-password -role -email")
        .paginate(page, itemsPerPage, async (error, follows, total) => {

            let followUserIds = await followConfig.followUsuariosIds(req.usuario.id);
            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que me siguen",
                usuarioIniciado: usuarioId,
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                usuarios_following: followUserIds.following,
                usuarios_follow_me: followUserIds.followers
            });
        })
}