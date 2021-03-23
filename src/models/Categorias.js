const { Schema, model } = require("mongoose");

const CategoriasSchema = new Schema({
	nombre: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("categorias", CategoriasSchema);
