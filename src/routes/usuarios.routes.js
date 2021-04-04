const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const usuariosController = require("../controllers/usuariosController");

router
	.get("/", authjwt, usuariosController.obtenerUsuarios)
	.delete("/:id", authjwt, usuariosController.eliminarUsuario)
    .get("/:id", authjwt, usuariosController.obtenerUsuario)

module.exports = router;
