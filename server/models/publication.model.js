const {Schema, model} = require("mongoose");

const PublicationSchema = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuario"
    },
    text: {
        type: String,
        require: true
    },
    file: String,
},{timestamps: true, versionKey: false});

module.exports = model("Publication", PublicationSchema, "publicaciones");
