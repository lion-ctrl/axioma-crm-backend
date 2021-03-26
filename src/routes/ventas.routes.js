const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const ventasController = require("../controllers/ventasController");

router
	.post("/", authjwt, ventasController.nuevaVenta)
	.get("/", authjwt, ventasController.mostrarVentas)
	.get("/:id", authjwt, ventasController.mostrarVenta)
	.put("/:id", authjwt, ventasController.actualizarVenta)
	.delete("/:id", authjwt, ventasController.eliminarVenta);

module.exports = router;
