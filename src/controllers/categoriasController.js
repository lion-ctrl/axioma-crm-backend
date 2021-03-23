const Categorias = require("../models/Categorias");

exports.nuevaCategoria = async (req, res) => {
	const nuevaCategoria = new Categorias(req.body);
	try {
		await nuevaCategoria.save();
		res.status(200).json({ msg: "Categoria creada" });
	} catch (error) {
		console.log(error);
	}
};

exports.actualizarCategoria = async (req, res) => {
	try {
		const categoria = await Categorias.findById(req.params.id);
		if (!categoria) {
			res.status(400).json({ msg: "No existe esa categoria" });
		}
		categoria.nombre = req.body.nombre;
		await categoria.save();
		res.status(200).json({ msg: "Categoria Actualizada" });
	} catch (error) {
		res.status(400).json({ msg: "No existe esa categoria" });
	}
};

exports.mostrarCategorias = async (req, res) => {
	try {
		const categorias = await Categorias.find({});
		res.status(200).json(categorias);
	} catch (error) {
		res.status(500).json({ msg: "Error en el servidor" });
	}
};

exports.eliminarCategoria = async (req,res) => {
    try {
		const categoria = await Categorias.findOne({ _id: req.params.id });
		if (!categoria) {
			res.status(400).json({ msg: "No Existe esa categoria" });
			return;
        }
        await Categorias.findByIdAndDelete(req.params.id);
		res.json({ msg: "Categoria Eliminada" });
	} catch (error) {
		res.status(400).json({ msg: "No Existe esa categoria" });
	}
}