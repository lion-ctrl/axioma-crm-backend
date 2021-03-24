const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const ventasController = require("../controllers/ventasController");

router
	.post("/", authjwt, ventasController.nuevaVenta)
	.get("/", authjwt, ventasController.mostrarVentas)
	// .get("/:id", authjwt, productosController.mostrarProducto)
	// .put("/:id", authjwt, productosController.actualizarProducto)
	// .delete("/:id", authjwt, productosController.eliminarProducto);

module.exports = router;
