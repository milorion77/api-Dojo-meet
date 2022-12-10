const PublicationController = require("../controllers/publication.controller");
const check = require("../middlewares/auth");
const multer = require("multer")

//esta es la configuracion para la subida de archivos
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./server/uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+"-"+file.originalname); //guardo las imagenes con el nombre avatar mas la fecha y su nombre original
    }
});

const uploads = multer({storage});

module.exports = app => {
    app.get("/api/publi/pruebapubli", PublicationController.pruebaPublicacion);
    app.post("/api/publi/guardar", check.auth, PublicationController.guardar);
    app.get("/api/publi/detalle/:id", check.auth, PublicationController.detalle);
    app.delete("/api/publi/remove/:id", check.auth, PublicationController.remove);
    app.get("/api/publi/usuario/:id/:page", check.auth, PublicationController.usuario);
    app.post("/api/publi/upload/:id", [check.auth, uploads.single("file0")], PublicationController.upload);
    app.get("/api/publi/media/:file", PublicationController.media);
    app.get("/api/publi/feed/:page?", check.auth, PublicationController.feed);
}