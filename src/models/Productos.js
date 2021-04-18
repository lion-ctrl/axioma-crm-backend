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
		trim: true,
	},
	costoTotal: {
		type: Number,
		required: true,
		trim: true,
	},
	ganancias: {
		type: Number,
		trim: true,
		default:0
	},
	cantidad: {
		type: Number,
		trim: true,
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
	categoria:{
		type:String,
		trim: true
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("productos", ProductosSchema);
