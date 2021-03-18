const router = require("express").Router();

const authController = require("../controllers/authController");
const authjwt = require("../middlewares/authjwt");

router
	.get("/", authjwt, authController.obtenerUsuario)
	.post("/", authController.validarUsuario,authController.autenticarUsuario)
	.post(
		"/nuevo-usuario",
        authjwt,
		authController.validarNuevoUsuario,
		authController.crearUsuario
	);

module.exports = router;
