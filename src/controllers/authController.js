const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Usuarios = require("../models/Usuarios");

exports.autenticarUsuario = async (req, res) => {
	const { email, password } = req.body;
	try {
		let usuario = await Usuarios.findOne({ email });
		if (!usuario) return res.status(400).json({ msg: "No Existe ese usuario" });

		if (!bcrypt.compareSync(password, usuario.password)) {
			return res.status(400).json({ msg: "Contraseña Incorrecta" });
		}
		const token = jwt.sign(
			{ _id: usuario._id, rol: usuario.rol },
			process.env.SECRETA,
			{ expiresIn: "12h" }
		);
		return res.status(200).json({ token });
	} catch (error) {
		console.log(error);
	}
};

exports.obtenerUsuario = async (req, res) => {
	try {
		const usuario = await Usuarios.findById(req.usuario._id).select(
			"-password"
		);
		return res.status(200).json(usuario);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Hubo un error" });
	}
};

exports.crearUsuario = async (req, res) => {
	try {
		let usuario = await Usuarios.findOne({ email: req.body.email });
		if (usuario) return res.status(400).json({ msg: "Ese correo ya existe" });

		usuario = new Usuarios(req.body);

		const salt = await bcrypt.genSalt(10);
		usuario.password = await bcrypt.hash(req.body.password, salt);
		await usuario.save();

		return res.status(200).json({ msg: "Usuario Creado correctamente" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Hubo un Error" });
	}
};

exports.editarUsuario = async (req,res) => {
	try {
		const usuario = await Usuarios.findOne({_id: req.params.id});
		if (!usuario) {
			res.status(400).json({msg: "Ese usuario no existe"});
			return;
		}

		if (usuario._id !== req.usuario._id) {
			res.status(400).json({msg: "Accion no permitida"});
			return;
		}

		const usuarioActualizado = await Usuarios.findByIdAndUpdate({_id: usuario._id},req.body,{new:true});
		res.status(200).json(usuarioActualizado);
	} catch (error) {
		console.log(error);
	}
}
