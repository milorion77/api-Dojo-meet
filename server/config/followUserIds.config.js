const Follow = require("../models/follow.model");

module.exports.followUsuariosIds = async (IdentidadUsuarioId) => {
    try {
        // Esto me saca la informacion de seguimiento
        let following = await Follow.find({ "usuario": IdentidadUsuarioId })
            .select({ "followed": 1, "_id": 0 })
            .exec();
        let followers = await Follow.find({ "followed": IdentidadUsuarioId })
            .select({ "usuario": 1, "_id": 0 })
            .exec();

        //procesar array de identificadores
        let followingClean = []  //clean porque esta un array y se ve mucho mas limpio jaja

        following.forEach(follow => {
            followingClean.push(follow.followed)
        });

        let followersClean = []

        followers.forEach(follow => {
            followersClean.push(follow.usuario)
        });

        return {
            following: followingClean,
            followers: followersClean
        }
    } catch (error) {
        return {};
    }
}

module.exports.followEsteUsuario = async (IdentidadUsuarioId, perfilUsuarioId) => {
    let following = await Follow.findOne({ "usuario": IdentidadUsuarioId, "followed": perfilUsuarioId });
    let followers = await Follow.findOne({ "followed": IdentidadUsuarioId, "followed": perfilUsuarioId });
    return {
        following,
        followers
    };
}