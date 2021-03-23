const { model, Schema } = require("mongoose");

const VentasSchema = new Schema({
	venta: [
		{
			producto: {
				type: Schema.Types.ObjectId,
				ref: "productos",
				required: true,
			},
			cantidad: {
				type: Number,
				required: true,
			},
		},
	],
	total: {
		type: Number,
		required: true,
	},
	pago: {
		type: String,
		trim: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("ventas", VentasSchema);
