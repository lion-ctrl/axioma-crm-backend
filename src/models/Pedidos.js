const { Schema, model } = require("mongoose");

const PedidosSchema = new Schema({
	productos: {
        type: Array,
        required:true
    },
	gastosExtras: {
		type: Number,
		default: 0,
	},
	costo: {
		type: Number,
		required: true,
	},
	ganancias: {
		type: Number,
		default: 0
	},
	estado: {
		type: String,
		default: "PROCESO",
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("pedidos", PedidosSchema);
