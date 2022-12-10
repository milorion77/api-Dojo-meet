const Usuario = require("../models/user.model");
const Publication = require("../models/publication.model");
const bcrypt = require("bcrypt"); //para la encriptacion de la contraseña
const jwt = require("../config/jwt.config")
const mongoosePagination = require("mongoose-pagination") // para la paginacion de la informacion 5 usuarios por pagina
const fs = require("fs"); //libreria filesystem que me sirve para manipular archivos, crear carpetas
const { send } = require("process");
const { exists } = require("../models/user.model");
const path = require("path");//libreria de node para rutas absolutas de archivos y poder enviarlas correctamente

const followConfig = require("../config/followUserIds.config");
const Follow = require("../models/follow.model");

module.exports.pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.controler.js",
        usuario: req.usuario
    });
}


module.exports.register = (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    //comprobar que me llegan bien mas la validacion
    if (!params.firstName || !params.lastName || !params.nick || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "faltan datos por enviar",
        });
    }

    // controll usuarios duplicados
    Usuario.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, usuarios) => {
        if (error) return res.status(500).json({ status: "error", menssage: "Error en la consulta de usuarios" });

        if (usuarios && usuarios.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "el usuario ya existe"
            });
        }

        // cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //Crear objeto de usuario
        let user_guardar = new Usuario(params);

        //Guardar usuario en la base de datos
        user_guardar.save((error, userStored) => {
            if (error || !userStored) return res.status(500).send({ status: "error", message: "error al guardar el ususario" });

            //Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario Registrado Exitosamente",
                usuario: userStored
            });
        });

    });

}

module.exports.login = (req, res) => {
    //recoger parametros body
    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "faltan datos por enviar"
        });
    }

    //Buscar en la base de datos si exise
    Usuario.findOne({ email: params.email })
        //.select({ "password": 0 }) // exec y select sirven para que podamos restringir que le enviamos al usuario
        .exec((error, usuario) => {
            if (error || !usuario) return res.status(404).send({
                status: "error",
                message: "No existe el usuario"
            });

            // comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, usuario.password)

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "no te has identificado correctamente"
                })
            }

            // Devolver Token
            const token = jwt.createToken(usuario);

            // Devolver Datos del usuario
            return res.status(200).send({
                status: "success",
                message: "Te has identificado correctamente",
                usuario: {
                    id: usuario._id,
                    firstName: usuario.firstName,
                    nick: usuario.nick
                },
                token
            });

        })
}

module.exports.profile = (req, res) => {
    // Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //Consulta para sacar los datos del usuario
    //const usuarioPerfil = await Usuario.findById(id);    esto me esta dando error; recordar en module.export.profile debe de ser async

    Usuario.findById(id)
        .select({ password: 0, role: 0 })
        .exec(async (error, usuarioPerfil) => {
            if (error || !usuarioPerfil) {
                return res.status(404).send({
                    status: "error",
                    message: "El usuario no existe o hay un error existente"
                });
            }
            // informacion de seguimiento
            const followInfo = await followConfig.followEsteUsuario(req.usuario.id, id)
            // Devolver el resultado

            return res.status(200).send({
                status: "success",
                usuario: usuarioPerfil,
                following: followInfo.following,
                follower: followInfo.followers
            });
        });

}

module.exports.list = (req, res) => {
    //controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);  // parseInt hace que el numero que se encuentre en page siempre sea entero y no un string

    //consulta con mongoose paginate
    let itemsPerPage = 5;

    Usuario.find().select("-password -email -role").sort('_id').paginate(page, itemsPerPage, async (error, usuarios, total) => {

        if (error || !usuarios) {
            return res.status(404).send({
                status: "success",
                message: "No hay usuarios disponibles",
                error
            });
        }
        //Listado de usuarios de usuario 1, y usuario 2. Entonces crear un array para poder ver los usuarios que ellos siguen en comun
        let followUserIds = await followConfig.followUsuariosIds(req.usuario.id);

        return res.status(200).send({
            status: "success",
            usuarios,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),//math.ceil me redondea la divicion entre 5 usarios por pagina por la cantidad de paginas y eso me da el todal de paginas que hay
            usuarios_following : followUserIds.following,
            usuarios_follow_me: followUserIds.followers
            
        });
    });



    //devolver el resultado (posteriormente info de follows)
}

module.exports.update = (req, res) => {
    // Recoger info del usuario a actualizar
    let usuarioIdentificado = req.usuario;
    let updateUsuario = req.body;

    //eliminar campos sobrantes
    delete updateUsuario.iat; // para que no me aparezcan los valores iat, y exp, porque sencillamente no los necesito acá
    delete updateUsuario.exp;
    delete updateUsuario.role;
    delete updateUsuario.image;

    // comprobar si el usuario ya exise
    Usuario.find({
        $or: [
            { email: updateUsuario.email.toLowerCase() },
            { nick: updateUsuario.nick.toLowerCase() }
        ]
    }).exec(async (error, usuarios) => {
        if (error) return res.status(500).json({ status: "error", menssage: "Error en la consulta de usuarios" });

        let userIsset = false;
        usuarios.forEach(usuario => {
            if (usuario && usuario._id != usuarioIdentificado.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "el usuario ya existe"
            });
        }

        // cifrar la contraseña
        if (updateUsuario.password) {
            let pwd = await bcrypt.hash(updateUsuario.password, 10);
            updateUsuario.password = pwd;
        }else{
            delete updateUsuario.password;
        }
        //Buscar y actualizar utilizando try, catch y await 
        try {
            let usuarioActualizado = await Usuario.findByIdAndUpdate({ _id: usuarioIdentificado.id }, updateUsuario, { new: true }); //

            if (!usuarioActualizado) {
                return res.status(400).send({ status: "error", message: "error al actualizar el ususario" });
            }
            //devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Metodo de Actualizar usuario",
                usuario: usuarioActualizado
            });
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al Actualizar usuario",
            });
        }
    });
}

//Metodo exclusivo que se dedica en subir archivos y actualizar el campo de la imagen que tenemos en cada uno de los documentos de la base de datos
module.exports.upload = (req, res) => {
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
    Usuario.findOneAndUpdate({ _id: req.usuario.id }, { image: req.file.filename }, { new: true }, (error, usuarioActualizado) => {
        if (error || !usuarioActualizado) {
            return res.status(500).send({
                status: "error",
                message: "Hay un Error en la subida del Avatar"
            })
        }

        return res.status(200).send({
            status: "success",
            usuario: usuarioActualizado,
            file: req.file
        });
    })
}

module.exports.avatar = (req, res) => {
    //sacar el parametro de la URL
    const file = req.params.file;

    //Montar el path real de la imagen
    const filePath = "./server/uploads/avatars/" + file;

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

//Contador
module.exports.counters = async (req, res) => {
    let usuarioId = req.usuario.id;
    if(req.params.id){
        usuarioId = req.params.id;
    }

    try {
        const following = await Follow.count({"usuario": usuarioId});
        const followed = await Follow.count({ "followed": usuarioId});
        const publicaciones = await Publication.count({"usuario" : usuarioId});

        return res.status(200).send({
            usuarioId,
            following: following,
            followed: followed,
            publicaciones: publicaciones
        });
    }catch (error){
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores"
        })
    }
}