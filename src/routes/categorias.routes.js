const router = require("express").Router();

const authjwt = require("../middlewares/authjwt");
const categoriasController = require("../controllers/categoriasController");

router
    .get("/", authjwt, categoriasController.mostrarCategorias)
	.post("/", authjwt, categoriasController.nuevaCategoria)
	.put("/:id", authjwt, categoriasController.actualizarCategoria)
	.delete("/:id", authjwt, categoriasController.eliminarCategoria);

module.exports = router;
