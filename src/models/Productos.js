const { Schema, model } = require("mongoose");

const ProductosSchema = new Schema({
	nombre: {
		type: String,
		required: true,
		trim: true,
		unique:true
	},
	precioCosto: {
		type: Number,
		required: true,
	},
	precioVenta: {
		type: Number,
		required: true,
		trim: true,
	},
	costoTotal: {
		type: Number,
		required: true,
		trim: true,
	},
	ventaTotal: {
		type: Number,
		required: true,
		trim: true,
	},
	cantidad: {
		type: Number,
		required: true,
		trim: true,
	},
	metodoContable: {
		type: String,
		default: "CANTIDAD"
	},
	imagen: {
		type: String,
		trim: true,
	},
	slug:{
		type: String,
		trim: true,
		required: true
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("productos", ProductosSchema);
