const { model, Schema } = require("mongoose");

const VentasSchema = new Schema({
	productos: Array,
	total: {
		type: Number,
		required: true,
	},
	metodo: {
		type: String,
		required: true
	},
	nombre: {
		type: String,
		required: true
	},
	usuario: {
		type: Schema.Types.ObjectId,
		ref: "usuarios",
		required: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("ventas", VentasSchema);