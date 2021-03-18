const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
require("dotenv").config({path:"variables.env"})

const Usuarios = require("../models/Usuarios");

exports.autenticarUsuario = (req, res) => {};

exports.obtenerUsuario = (req, res) => {};

exports.validarNuevoUsuario = [
	check("nombre", "El nombre es obligatorio").notEmpty(),
	check("email", "Agrega un email valido").isEmail(),
	check("password", "La contraseña debe ser de minimo 6 caracteres").isLength({
		min: 6,
	}),
	function (req, res, next) {
		const errores = validationResult(req);
		if (!errores.isEmpty()) {
			return res.status(400).json({ errores: errores.array() });
		}
		next();
	},
];

exports.crearUsuario = async (req, res) => {
	try {
		let usuario = await Usuarios.findOne({ email: req.body.email });
		if (usuario) return res.status(400).json({ msg: "Ese correo ya existe" });

		usuario = new Usuarios(req.body);

		const salt = await bcrypt.genSalt(10);
		usuario.password = await bcrypt.hash(req.body.password, salt);
		await usuario.save();

		// JWT
		const token = jwt.sign({ _id: usuario._id }, process.env.SECRETA, { expiresIn: "24h" });
        return res.status(200).json({token})
	} catch (error) {
		console.log(error);
        res.status(400).json({msg: "Hubo un Error"});
	}
};
