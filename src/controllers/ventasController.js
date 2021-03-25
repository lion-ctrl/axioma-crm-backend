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
	const { fechaInicial, fechaFinal } = req.body;
	try {
		const ventas = await Ventas.find({
			$and: [
				{ creado: { $gte: new Date(`${fechaInicial}T00:00:00.000+00:00`) } },
				{ creado: { $lte: new Date(`${fechaFinal}T00:59:59.999+00:00`) } },
			],
		});
		res.status(200).json(ventas);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarVenta = async (req, res) => {
	try {
		const venta = await Ventas.findById(req.params.id);
		if (!venta) return res.status(400).json({ msg: "No existe esa venta" });
		res.status(200).json(venta);
	} catch (error) {
		res.status(400).json({ msg: "No existe esa venta" });
	}
};

exports.eliminarVenta = async (req,res) => {
	try {
		const venta = await Ventas.findById(req.params.id);
		if (!venta) return res.status(400).json({ msg: "No existe esa venta" });
		
		await Ventas.findByIdAndDelete(req.params.id);
		res.status(200).json({ msg: "Venta Eliminada" });
	} catch (error) {
		res.status(400).json({ msg: "No existe esa venta" });
	}
}