const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const productosController = require("../controllers/productosController");

router
	.post("/", authjwt, productosController.nuevoProducto)
	.get("/", authjwt, productosController.mostrarProductos)
	.get("/:id", authjwt, productosController.mostrarProducto)
	.put("/", authjwt, productosController.actualizarProducto)
	.delete("/", authjwt, productosController.eliminarProducto);

module.exports = router;
