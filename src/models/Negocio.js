const { Schema, model } = require("mongoose");

const negocioSchema = new Schema({
	nombre: {
		type: String,
        default: "Sin nombre",
		trim: true,
	},
	direccion: {
		type: String,
        default: "",
		trim: true,
	},
	ciudad: {
		type: String,
        default: "",
		trim: true,
	},
	telefono: {
		type: String,
        default: "",
		trim: true,
	},
	email: {
		type: String,
        default: "",
		unique: true,
	},
});

module.exports = model("negocio", negocioSchema);
