const { Schema, model } = require("mongoose");

const ProductosSchema = new Schema({
	nombre: {
		type: String,
		required: true,
		trim: true,
	},
	precioCompra: {
		type: Number,
		required: true,
	},
    precioVenta: {
		type: Number,
		required: true,
		trim: true,
	},
    cantidad: {
		type: Number,
		required: true,
		trim: true,
	},
	imagen: {
		type: String,
		trim: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("productos", ProductosSchema);