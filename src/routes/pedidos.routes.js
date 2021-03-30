const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const pedidosController = require("../controllers/pedidosController");

router
	.post("/", authjwt, pedidosController.nuevoPedido)
	.get("/", authjwt, pedidosController.mostrarPedidos)
	.get("/fecha", authjwt, pedidosController.mostrarPedidosFecha)
	.get("/:id", authjwt, pedidosController.mostrarPedido)
    .delete("/:id", authjwt, pedidosController.eliminarPedido)
    .put("/:id", authjwt, pedidosController.actualizarPedido)
    .put("/completado/:id", authjwt, pedidosController.pedidoCompletado)

module.exports = router;
