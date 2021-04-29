const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Usuarios = require("../models/Usuarios");

exports.autenticarUsuario = async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const usuarios = await Usuarios.find({});
		if (usuarios.length === 0) {
			next();
			return;
		}
		let usuario = await Usuarios.findOne({ email });
		if (!usuario) {
			res.status(400).json({ msg: "No Existe ese usuario" });
			return;
		}

		if (!bcrypt.compareSync(password, usuario.password)) {
			res.status(400).json({ msg: "Contraseña Incorrecta" });
			return;
		}
		const token = jwt.sign(
			{ _id: usuario._id, rol: usuario.rol },
			process.env.SECRETA,
			{ expiresIn: "12h" }
		);
		return res.status(200).json({ token });
	} catch (error) {
		res.status(400).json({ msg: "No Existe ese usuario" });
		console.log(error);
	}
};

exports.crearPrimerUsuario = async (req,res) => {
	const { email, password } = req.body;
	try {
		let usuario = new Usuarios();
		usuario.nombre = "nombre";
		usuario.apellido = "apellido";
		usuario.email = email;
		usuario.rol = "ADMIN";
		const salt = await bcrypt.genSalt(10);
		usuario.password = await bcrypt.hash(password, salt);
		await usuario.save();

		const token = jwt.sign(
			{ _id: usuario._id, rol: usuario.rol },
			process.env.SECRETA,
			{ expiresIn: "12h" }
		);
		return res.status(200).json({ token });
	} catch (error) {
		res.status(400).json({ msg: "Error en el servidor" });
		console.log(error);
	}
}

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

exports.editarUsuario = async (req, res) => {

	try {
		const usuario = await Usuarios.findOne({ _id: req.params.id });
		if (!usuario) {
			res.status(400).json({ msg: "Ese usuario no existe" });
			return;
		}
		if (usuario._id.toString() !== req.usuario._id) {
			res.status(400).json({ msg: "Accion no permitida" });
			return;
		}

		if (usuario.rol !== "EMPLEADO") {
			if (req.body.rol === "EMPLEADO") {
				const admins = await Usuarios.find({ rol: "ADMIN" }).countDocuments();
				if (admins === 1) {
					res
						.status(400)
						.json({ msg: "Debe existir al menos un usuario ADMINISTRADOR" });
					return;
				}
			}
		}

		const clienteEmail = await Usuarios.findOne({ email: req.body.email });
		if (clienteEmail) {
			if (clienteEmail._id.toString() !== usuario._id.toString()) {
				res.status(400).json({ msg: "Ya existe ese correo" });
				return;
			}
		}

		const usuarioActualizado = await Usuarios.findByIdAndUpdate(
			{ _id: usuario._id },
			req.body,
			{ new: true }
		);
		res.status(200).json({ usuarioActualizado, msg: "Usuario Editado" });
	} catch (error) {
		res.status(500).json({ msg: "Error en el servidor" });
	}
};

exports.editarPassword = async (req, res) => {
	const { email, passanterior, passnueva } = req.body;
	try {
		let usuario = await Usuarios.findOne({ email });
		if (!usuario) {
			res.status(400).json({ msg: "No Existe ese usuario" });
			return;
		}

		if (usuario._id.toString() !== req.usuario._id) {
			res.status(400).json({ msg: "Accion no permitida" });
			return;
		}

		if (!bcrypt.compareSync(passanterior, usuario.password)) {
			res.status(400).json({ msg: "Contraseña Incorrecta" });
			return;
		}

		const salt = await bcrypt.genSalt(10);
		usuario.password = await bcrypt.hash(passnueva, salt);

		await usuario.save();
		res.status(200).json({ msg: "Contraseña editada" });
	} catch (error) {
		res.status(400).json({ msg: "Error en el servidor" });
	}
};
