const mongoose = require('mongoose');


    const FollowSchema = new mongoose.Schema({
        usuario:{ //aqui guardo el identificador del objeto de ususario que sigue a alquien
            type: mongoose.Schema.ObjectId,
            ref: "usuario"
        },
        followed: { //aqui guardo el identificador del objeto de ususario seguido por el usuario
            type: mongoose.Schema.ObjectId,
            ref: "usuario"
        }
}, {timestamps: true, versionKey: false});

const Follow = mongoose.model("follows", FollowSchema)
module.exports = Follow;