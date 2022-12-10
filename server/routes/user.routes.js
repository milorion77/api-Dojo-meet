const UserController = require("../controllers/user.controller");
const check = require("../middlewares/auth");
const multer = require("multer") //Multer se encarga de subir archivos al servidor, procesa las peticiones de subida

//esta es la configuracion para la subida de archivos
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./server/uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname); //guardo las imagenes con el nombre avatar mas la fecha y su nombre original
    }
});

const uploads = multer({storage});

module.exports = app => {
    app.get("/api/pruebausuario", check.auth, UserController.pruebaUser);
    app.post('/api/register', UserController.register);
    app.post("/api/login", UserController.login);
    app.get("/api/profile/:id", check.auth, UserController.profile);
    app.get("/api/list/:page?", check.auth, UserController.list);
    app.put("/api/update", check.auth, UserController.update); //no necesito que en el update sea con el parametro en url :id, ya que con la autentificacion se asegura que sea el mismo usuario
    app.post("/api/upload", [check.auth, uploads.single("file0")], UserController.upload); //meto mas de un middleware en un array para que me funcione
    app.get("/api/avatar/:file", UserController.avatar);
    app.get("/api/counters/:id", check.auth, UserController.counters);
}