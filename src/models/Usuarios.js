const { Schema, model } = require("mongoose");

const UsuariosSchema = new Schema({
	nombre: {
		type: String,
		required: true,
		trim: true,
	},
	apellido: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	rol: {
		type: String,
		default: "EMPLEADO"
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("usuarios", UsuariosSchema);