const Negocio = require("../models/Negocio");

exports.obtenerNegocio = async (req, res, next) => {
	try {
		const negocio = await Negocio.find({});
		if (!negocio.length) {
			next();
			return;
		}
		res.status(200).json(negocio);
	} catch (error) {
		res.status(400).json({ msg: "Error en el servidor" });
		console.log(error);
	}
};

exports.crearNegocio = async (req, res) => {
	try {
		const negocio = new Negocio();
		await negocio.save();
		res.status(200).json([negocio]);
	} catch (error) {
		res.status(400).json({ msg: "Error en el servidor" });
		console.log(error);
	}
};

exports.editarNegocio = async (req, res) => {

	try {
		let negocio = await Negocio.findOne({ _id: req.body._id });
		if (!negocio) return res.status(200).json({ msg: "No existe ese negocio" });

		negocio = await Negocio.findByIdAndUpdate({ _id: req.body._id }, req.body, {
			new: true,
		});
		res.status(200).json(negocio);
	} catch (error) {
        console.log(error);
		res.status(400).json({msg: "Error en el servidor"});
	}
};
