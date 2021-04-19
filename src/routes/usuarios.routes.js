const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const adminRol = require("../middlewares/adminRol");
const usuariosController = require("../controllers/usuariosController");

router
	.get("/", authjwt, adminRol, usuariosController.obtenerUsuarios)
	.delete("/:id", authjwt, adminRol, usuariosController.eliminarUsuario)
    .get("/:id", authjwt, adminRol, usuariosController.obtenerUsuario)

module.exports = router;
