const Usuarios = require("../models/Usuarios");
const Ventas = require("../models/Ventas")

exports.obtenerUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuarios.find({ rol: "EMPLEADO" }).sort({
			creado: -1,
		});
		res.status(200).json(usuarios);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Error en el servidor" });
	}
};

exports.eliminarUsuario = async (req, res) => {

	try {
		const usuario = await Usuarios.findById(req.params.id);
		if (!usuario) res.status(400).json({ msg: "No existe ese usuario" });
		await usuario.delete();
		res.status(200).json({_id: usuario._id });
	} catch (error) {
		res.status(400).json({ msg: "No existe ese usuario" });
	}
};

exports.obtenerUsuario = async (req,res) => {

    try {
		const usuario = await Usuarios.findById(req.params.id);
		if (!usuario) res.status(400).json({ msg: "No existe ese usuario" });
		const ventas = await Ventas.find({usuario:usuario._id})
		res.status(200).json({usuario,ventas});
	} catch (error) {
		res.status(400).json({ msg: "No existe ese usuario" });
	}
}