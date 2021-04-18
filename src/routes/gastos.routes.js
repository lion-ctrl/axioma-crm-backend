const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const gastosController = require("../controllers/gastosController");

router
	.post("/", authjwt, gastosController.nuevoGasto)
	.get("/", authjwt, gastosController.mostrarGastos)
	.get("/fecha", authjwt, gastosController.mostrarGastosFecha)
	.get("/:id", authjwt, gastosController.mostrarGasto)
    .delete("/:id", authjwt, gastosController.eliminarGasto)
    .put("/:id", authjwt, gastosController.editarGasto)

module.exports = router;
