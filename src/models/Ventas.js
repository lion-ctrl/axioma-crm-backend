const { model, Schema } = require("mongoose");

const VentasSchema = new Schema({
	ventas: {
		type: Array,
		required: true,
	},
	total: {
		type: Number,
		required: true,
	},
	pago: {
		type: String,
		trim: true,
	},
	usuario: {
		type: Schema.Types.ObjectId,
		ref: "usuario",
		required: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("ventas", VentasSchema);
