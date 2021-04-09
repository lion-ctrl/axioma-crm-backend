const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const productosController = require("../controllers/productosController");

router
	.post(
		"/",
		authjwt,
		productosController.subirImagen,
		productosController.nuevoProducto
	)
	.get("/", authjwt, productosController.mostrarProductos)
	.get("/:slug", authjwt, productosController.mostrarProducto)
	.put(
		"/:id",
		authjwt,
		productosController.subirImagen,
		productosController.actualizarProducto
	)
	.delete("/:id", authjwt, productosController.eliminarProducto);

module.exports = router;
