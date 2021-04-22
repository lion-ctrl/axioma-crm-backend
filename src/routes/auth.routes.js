const router = require("express").Router();

const authController = require("../controllers/authController");
const authjwt = require("../middlewares/authjwt");

router
	.get("/", authjwt, authController.obtenerUsuario)
	.post("/", authController.autenticarUsuario)
	.post("/nuevo-usuario", authjwt, authController.crearUsuario)
	.put("/:id", authjwt, authController.editarUsuario)
	.put("/password/:id", authjwt, authController.editarPassword);

module.exports = router;
