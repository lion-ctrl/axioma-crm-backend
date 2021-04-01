const Ventas = require("../models/Ventas");
const Productos = require("../models/Productos");
const Pedidos = require("../models/Pedidos");

exports.nuevaVenta = async (req, res) => {
	const { ventas } = req.body;
	try {
		// - verificar que hayan suficientes productos
		const producto = await crearVenta(ventas);
		if (!producto.res) {
			res.status(400).json({
				msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
			});
			return;
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

const actualizarPedidos = async (productoPedidos, cantidad, articulo) => {
	const productosPedidosCopia = [];
	for await (const pedido of productoPedidos) {
		const pedidoProducto = await Pedidos.findOne({
			_id: pedido._id,
		});
		if (pedidoProducto) {
			if (pedido.cantidad > 0) {
				if (pedido.cantidad >= cantidad) {
					pedidoProducto.ganancias += cantidad * articulo.precioVenta;

					pedido.cantidad = pedido.cantidad - cantidad;
					productosPedidosCopia.push(pedido);
					await pedidoProducto.save();
					break;
				} else {
					pedidoProducto.ganancias += pedido.cantidad * articulo.precioVenta;
					cantidad -= pedido.cantidad;
					pedido.cantidad = 0;
					productosPedidosCopia.push(pedido);
					await pedidoProducto.save();
				}
			}
		}
	}
	return productosPedidosCopia;
};

const crearVenta = async (ventas) => {
	let product = {
		res:true
	};
	for await (const articulo of ventas) {
		const { _id } = articulo;
		const producto = await Productos.findById(_id);
		if (articulo.cantidad > producto.cantidad) {
			product.res = false;
			product.nombre = producto.nombre
			break;
		} else {
			producto.cantidad = producto.cantidad - articulo.cantidad;
			producto.ganancias += articulo.cantidad * articulo.precioVenta;
			let cantidad = articulo.cantidad;

			if (producto.pedidos.length) {
				let pedidosActualizados = await actualizarPedidos(
					producto.pedidos,
					cantidad,
					articulo
				);
				for (let i = 0; i < producto.pedidos.length; i++) {
					for (let e = 0; e < pedidosActualizados.length; e++) {
						if (pedidosActualizados[e] === producto.pedidos[i]) {
							producto.pedidos.splice(i, 1);
							producto.pedidos.push(pedidosActualizados[e]);
						}
					}
				}
			}
			await producto.save();
		}
	}
	return product;
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

		await devolucionVentas(ventaAnterior.ventas)

		// - verificar que hayan suficientes productos
		const producto = await crearVenta(ventaNueva.ventas);
		if (!producto.res) {
			res.status(400).json({
				msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
			});
			return;
		}

		await Ventas.findByIdAndUpdate({ _id: req.params.id }, ventaNueva);

		res.status(200).json({ msg: "Venta Actualizada" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe esa venta" });
	}
};

const devolucionPedidos = async (pedidosVentaAnterior,cantidad,articulo) => {
	const productosPedidosCopia = [];
	for await (const pedido of pedidosVentaAnterior) {
		const pedidoProducto = await Pedidos.findOne({ _id: pedido._id });
		if (pedido.total >= cantidad) {
			pedidoProducto.ganancias -= cantidad * articulo.precioVenta;
			pedido.cantidad += cantidad;
			productosPedidosCopia.push(pedido);
			await pedidoProducto.save();
			break;
		} else {
			pedidoProducto.ganancias -= pedido.total * articulo.precioVenta;
			pedido.cantidad = pedido.total;
			cantidad -= pedido.total;
			productosPedidosCopia.push(pedido);
			await pedidoProducto.save();
		}
	}
	return productosPedidosCopia;
}

const devolucionVentas = async (ventas) => {
	for await (const articulo of ventas) {
		const producto = await Productos.findById(articulo._id);
		producto.cantidad = producto.cantidad + articulo.cantidad;
		producto.ganancias -= producto.ganancias;
		if (producto.pedidos.length) {
			let cantidad = producto.cantidad;
			const pedidosVentaAnterior = producto.pedidos.reverse();
			let pedidosActualizados = await devolucionPedidos(pedidosVentaAnterior,cantidad,articulo);
			for (let i = 0; i < producto.pedidos.length; i++) {
				for (let e = 0; e < pedidosActualizados.length; e++) {
					if (pedidosActualizados[e] === producto.pedidos[i]) {
						producto.pedidos.splice(i, 1);
						producto.pedidos.push(pedidosActualizados[e]);
					}
				}
			}
		}
		await producto.save();
	}
}