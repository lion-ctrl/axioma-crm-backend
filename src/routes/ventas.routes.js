const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const ventasController = require("../controllers/ventasController");

router
	.post("/", authjwt, ventasController.nuevaVenta)
	.get("/", authjwt, ventasController.mostrarVentas)
	.get("/semana", authjwt, ventasController.mostrarVentasSemanal)
	.get("/fecha", authjwt, ventasController.mostrarVentasFecha)
	.get("/:id", authjwt, ventasController.mostrarVenta)
	.put("/:id", authjwt, ventasController.editarVenta)
	.delete("/:id", authjwt, ventasController.eliminarVenta);

module.exports = router;
