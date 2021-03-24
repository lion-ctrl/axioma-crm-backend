const Ventas = require("../models/Ventas");
const Productos = require("../models/Productos");

exports.nuevaVenta = async (req, res) => {
	const { ventas } = req.body;
	try {
		// - verificar que hayan suficientes productos
		for await (const articulo of ventas) {
			const { productoId } = articulo;
			const producto = await Productos.findById(productoId);
			if (articulo.cantidad > producto.cantidad) {
				res.status(400).json({
					msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
				});
				return;
			} else {
				producto.cantidad = producto.cantidad - articulo.cantidad;
				await producto.save();
			}
		}
		// - Asignar el usuario que realizo la venta
		let nuevaVenta = new Ventas(req.body);
		nuevaVenta.usuario = req.usuarioId;

		await nuevaVenta.save();
		res.status(200).json(nuevaVenta);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarVentas = async (req, res) => {
	const {fechaInicial, fechaFinal} = req.body;
	try {
		const ventas = await Ventas.find({
			$and: [
				{ creado: { $gte: new Date(fechaInicial) } },
				{ creado: { $lte: new Date(fechaFinal) } },
			],
		}).populate({ path: "ventas.productoId", model: "productos" }).select();
		res.status(200).json(ventas);
	} catch (error) {
		console.log(error);
	}
};
