const Publication = require("../models/publication.model");
//modulo
const fs = require("fs")//libreria filesystem que me sirve para manipular archivos, crear carpetas
const path = require("path")//libreria de node para rutas absolutas de archivos y poder enviarlas correctamente
//followconfig
const followconfig = require("../config/followUserIds.config");
const { match } = require("assert");


module.exports.pruebaPublicacion = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.controller.js"
    });
}

// Guardar publicacion
module.exports.guardar = (req, res) => {
    //recoger datos del body
    const params = req.body;

    //si no me llegan, poner una respuesta negativa
    if (!params.text) return res.status(400).send({ status: "error", message: "El campo text no puede estar vacío" });

    //Crear y rellenar el objeto del modelo
    let nuevaPublicacion = new Publication(params);
    nuevaPublicacion.usuario = req.usuario.id;

    //Guardar el objeto en la base de datos
    nuevaPublicacion.save((error, publicationStored) => {
        if (error || !publicationStored) return res.status(400).send({ status: "error", message: "no se ha guardado la publicacion" });
        //Devolver respuesta
        return res.status(200).send({
            status: "succes",
            message: "Publicacion guardada",
            publicationStored
        })
    });




}

//Sacar una Publicacion
module.exports.detalle = (req, res) => {
    //sacar el id de la publicacion por url params
    const publicacionId = req.params.id;

    //find con la condicion del id 
    Publication.findById(publicacionId, (error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            })
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "succes",
            message: "Mostrar publicacion",
            Publicacion: publicationStored
        });
    });
}

// Eliminar publicaciones
module.exports.remove = (req, res) => {
    //sacar elid de la publicacion a eliminar
    const publicacionId = req.params.id;

    // find y luego eliminar
    Publication.find({ "usuario": req.usuario.id, "_id": publicacionId }).deleteOne(error => {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido borrar la publicacion"
            })
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "succes",
            message: "Eliminar publicacion",
            Publicacion: publicacionId
        });
    })
}

// Listar todas las publicaciones de un usuario
module.exports.usuario = (req, res) => {
    //sacar el dentificador del ususario
    const usuarioId = req.params.id;

    //controlar el numero de la apgina
    let page = 1;
    if (req.params.page) page = req.params.page
    const itemsPerPage = 5;

    //find, populate, ordenar de viajo a mas reciente y paginar
    Publication.find({ "usuario": usuarioId })
        .sort("-createdAt")
        .populate('usuario', '-password -role -email')
        .paginate(page, itemsPerPage, (error, publicaciones, total) => {
            if (error || !publicaciones || publicaciones.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    message: "no hay publicaciones para mostrar"
                });
            }
            //Devolver respuesta
            return res.status(200).send({
                status: "succes",
                message: "Publicaciones del perfil de un usuario",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publicaciones
            });
        })

}

// Subir ficheros
//Metodo exclusivo que se dedica en subir archivos y actualizar el campo de la imagen que tenemos en cada uno de los documentos de la base de datos
module.exports.upload = (req, res) => {
    //sacar publicacionId
    const publicacionId = req.params.id;
    //recoger el fichero de imagen y comrobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La peticion no incluye la imagen"
        })
    }

    //conseguir el nombre del archivo
    let image = req.file.originalname;

    //sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1]

    //Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //Esto me Borra el archivo subido si no pertenece a ninguna de las extensiones
        const filePath = req.file.path; //para ver la ruta en donde se guardó el archivo
        const fileBorrado = fs.unlinkSync(filePath);//unlink sirve para eliminar un archivo, y el sync es para que no necesite una funcion callback y se pueda eliminar directamente

        //Me devuelve una respuesta negativa si hay un error
        return res.status(400).send({
            status: "error",
            message: "Ruta del fichero invalida"
        })
    }

    //si es correcto, guarda la imagen en la base de datos
    Publication.findOneAndUpdate({ "usuario": req.usuario.id, "_id": publicacionId }, { file: req.file.filename }, { new: true }, (error, publicacionActualizada) => {
        if (error || !publicacionActualizada) {
            return res.status(500).send({
                status: "error",
                message: "Hay un Error en la subida"
            })
        }

        return res.status(200).send({
            status: "success",
            publicacion: publicacionActualizada,
            file: req.file
        });
    })
}

module.exports.media = (req, res) => {
    //sacar el parametro de la URL
    const file = req.params.file;

    //Montar el path real de la imagen
    const filePath = "./server/uploads/publications/" + file;

    //Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la ruta"
            });
        }
        //Devolver un file
        return res.sendFile(path.resolve(filePath)); //(filePath) El filePath que se encuentra alli es una ruta fisica del archivo que ingresa como string, pero el path.resolve hace que esta misma se envie como una ruta absoluta que se pueda enviar
    });

}

// Listar todas las publicaciones (el Feed)
module.exports.feed = async (req, res) => {
    //sacar lapagina actual
    let page = 1;
    //como en la url mandamos un opcional "page?" si no me llega queda en default 1, pero si me llega
    if (req.params.page) {
        page = req.params.page;
    }
    //Establecer numero de elementos por pagina
    let itemsPerPage = 5;

    //sacar una array de identificadores de usuarios que yo sigo como usuario logueado
    try {
        const myFollows = await followconfig.followUsuariosIds(req.usuario.id);

        //find a publicaciones con operador "in", ordernar, utilizar populate, paginar
        const publicaciones =  Publication.find({
            usuario: myFollows.following
        }).populate("usuario", "-password -role -email")
        .sort("-createdAt").paginate(page, itemsPerPage, (error, publicaciones, total) => {

            if(error || !publicaciones){
                return res.status(500).send({
                    status: "error",
                    message: "No hay publicaciones para mostrar"
                });
            }

            return res.status(200).send({
                status: "success",
                message: "Mostrar feed",
                following: myFollows.following,
                total,
                page,
                pages: Math.ceil(total / itemsPerPage),
                publicaciones
            });
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se han listado las publicaciones del feed"
        });
    }



}


// Devolver archivos multimedia que en este  caso seran solo imagenes