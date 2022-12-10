const express = require("express");
const cors = require("cors");
const app = express();

//Para poder usar json y obtener datos de la URL
//convierte los datos del body a objetos Js
app.use(express.json(), express.urlencoded({extended: true}));//app.use es un middleware, esto es algo que se ejecuta antes que las propias rutas que va a tener la API

//Permite acceder de un origen distinto 
app.use(
    cors({
        //URL de front end
        origin: "http://127.0.0.1:5173",//origen de las consultas o peticiones desde vite, son en esta ruta
        //credentials: true //Usuario iniciado sesión, es decir que tenga credenciales
    }),
);


//Inicializa BD
require("./server/config/mongoose.config");

//Importamos rutas
const rutaUsers = require("./server/routes/user.routes");
rutaUsers(app);
const rutaFollows = require("./server/routes/follow.routes");
rutaFollows(app);
const rutaPublications = require("./server/routes/publication.routes");
rutaPublications(app);
//Ejecutamos server
app.listen(8000, () => console.log("servidor listo!"));