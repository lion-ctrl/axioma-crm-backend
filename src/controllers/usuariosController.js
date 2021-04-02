const Usuarios = require("../models/Usuarios");

exports.obtenerUsuarios = async (req, res) => {
	if (req.usuario.rol !== "ADMIN") {
		res.status(400).json({ msg: "Acceso no permitido" });
	}
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
	if (req.usuario.rol !== "ADMIN") {
		res.status(400).json({ msg: "Acceso no permitido" });
	}

	try {
		const usuario = await Usuarios.findById(req.params.id);
		if (!usuario) res.status(400).json({ msg: "No existe ese usuario" });
		await usuario.delete();
		res.status(200).json({ msg: "Usuario Eliminado", _id: usuario._id });
	} catch (error) {
		res.status(400).json({ msg: "No existe ese usuario" });
	}
};
