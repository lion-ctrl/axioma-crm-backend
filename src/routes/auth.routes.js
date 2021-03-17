const router = require("express").Router();

const authController = require("../controllers/authController");

router
	.get("/", authController.obtenerUsuario)
	.post("/", authController.autenticarUsuario)
	.post("/nuevo-usuario", authController.crearUsuario);

module.exports = router;
