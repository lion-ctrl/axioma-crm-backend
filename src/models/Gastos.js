const { Schema, model } = require("mongoose");

const GastosSchema = new Schema({
	nombre: {
		type: String,
		required: true
	},
	tipo: {
		type: String,
		required: true
	},
	metodo: {
		type: String,
		required: true
	},
	productos: {
        type: Array
    },
	costo: {
		type: Number,
		required: true,
	},
	creado: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = model("gastos", GastosSchema);
