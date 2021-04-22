const router = require("express").Router();

const negocioController = require("../controllers/negocioController");
const authjwt = require("../middlewares/authjwt");

router
	.get(
		"/",
		authjwt,
		negocioController.obtenerNegocio,
		negocioController.crearNegocio
	)
	.put("/", authjwt, negocioController.editarNegocio);

module.exports = router;
