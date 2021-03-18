const { Schema, model } = require("mongoose");

const ProductosSchema = new Schema({
	nombre: {
		type: String,
		required: true,
		trim: true,
	},
	precio: {
		type: Number,
		required: true,
	},
	imagen: {
		type: String,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("productos", ProductosSchema);
