const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/proyectoMernDB", {
    useNewUrlParser: true,
	useUnifiedTopology: true
})
    .then(()=> console.log("Conectado la Base de Datos"))
    .catch(err => console.log("No se ha podido conectar a la Base de Datos ", err));