const Ventas = require("../models/Ventas");
const Productos = require("../models/Productos");
const Pedidos = require("../models/Pedidos");

exports.nuevaVenta = async (req, res) => {
	const { ventas } = req.body;
	try {
		// - verificar que hayan suficientes productos
		for await (const articulo of ventas) {
			const { _id } = articulo;
			const producto = await Productos.findById(_id);
			if (articulo.cantidad > producto.cantidad) {
				res.status(400).json({
					msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
				});
				return;
			} else {
				producto.cantidad = producto.cantidad - articulo.cantidad;
				producto.ganancias += articulo.cantidad * articulo.precioVenta;
				let cantidad = articulo.cantidad;

				if (producto.pedidos) {
					for await (const pedido of producto.pedidos) {
						const pedidoProducto = await Pedidos.findOne({
							_id: pedido._id,
						}).sort({ creado: -1 });
						if (pedidoProducto) {
							if (pedido.cantidad > 0) {
								if (pedido.cantidad > cantidad) {
									pedidoProducto.ganancias += cantidad * articulo.precioVenta;

									const indicePedido = producto.pedidos.indexOf(pedido);
									producto.pedidos.splice(indicePedido,1);

									pedido.cantidad = pedido.cantidad - cantidad;
									producto.pedidos.push(pedido);
									await pedidoProducto.save();
									break;
								} else {
									const indicePedido = producto.pedidos.indexOf(pedido);
									producto.pedidos.splice(indicePedido,1);

									pedidoProducto.ganancias += pedido.cantidad * articulo.precioVenta;
									cantidad -= pedido.cantidad;
									// pedido.cantidad = 0;
									// producto.pedidos.push(pedido);
									await pedidoProducto.save();
								}
							}
						}
					}
				}
				await producto.save();
			}
		}
		// - Asignar el usuario que realizo la venta
		let nuevaVenta = new Ventas(req.body);
		nuevaVenta.usuario = req.usuario._id;

		await nuevaVenta.save();
		res.status(200).json(nuevaVenta);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarVentas = async (req, res) => {
	try {
		const mes = new Date();
		const ventas = await Ventas.find({
			$expr: { $eq: [{ $month: "$creado" }, { $month: mes }] },
		});

		res.status(200).json(ventas);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarVentasFecha = async (req, res) => {
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

exports.eliminarVenta = async (req, res) => {
	try {
		const venta = await Ventas.findById(req.params.id);
		if (!venta) return res.status(400).json({ msg: "No existe esa venta" });

		await Ventas.findByIdAndDelete(req.params.id);
		res.status(200).json({ msg: "Venta Eliminada" });
	} catch (error) {
		res.status(400).json({ msg: "No existe esa venta" });
	}
};

exports.actualizarVenta = async (req, res) => {
	const ventaNueva = req.body;

	try {
		const ventaAnterior = await Ventas.findById(req.params.id);
		if (!ventaAnterior)
			return res.status(400).json({ msg: "No existe esa venta" });

		if (req.usuario.rol === "EMPLEADO") {
			if (ventaAnterior.usuario.toString() !== req.usuario._id.toString())
				return res.status(400).json({ msg: "Acción no permitida" });
		}

		for await (const articulo of ventaAnterior.ventas) {
			const producto = await Productos.findById(articulo._id);
			producto.cantidad = producto.cantidad + articulo.cantidad;
			producto.ganancias -= producto.ganancias;
			await producto.save();
		}

		for await (const articulo of ventaNueva.ventas) {
			const { _id } = articulo;
			const producto = await Productos.findById(_id);
			if (articulo.cantidad > producto.cantidad) {
				res.status(400).json({
					msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
				});
				return;
			} else {
				producto.cantidad = producto.cantidad - articulo.cantidad;
				producto.ganancias = articulo.cantidad * articulo.precioVenta;
				await producto.save();
			}
		}

		await Ventas.findByIdAndUpdate({ _id: req.params.id }, ventaNueva);

		res.status(200).json({ msg: "Venta Actualizada" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe esa venta" });
	}
};
