const Ventas = require("../models/Ventas");
const Productos = require("../models/Productos");

exports.nuevaVenta = async (req, res) => {
	const { productos } = req.body;
	try {
		// - verificar que hayan suficientes productos
		for await (const articulo of productos) {
			const { _id } = articulo;
			const producto = await Productos.findById(_id);
			if (articulo.resumen.cantidad > producto.cantidad) {
				res.status(400).json({
					msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
				});
				return;
			} else {
				producto.cantidad -= articulo.resumen.cantidad;
				producto.ganancias +=
					articulo.resumen.cantidad * articulo.resumen.precio;
			}
			await producto.save();
		}

		// - Asignar el usuario que realizo la venta
		let nuevaVenta = new Ventas(req.body);
		nuevaVenta.usuario = req.usuario._id;

		await nuevaVenta.save();
		res.status(200).json({ msg: "Venta creada" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarVentasSemanal = async (req, res) => {
	try {
		const hoy = new Date();
		const [ventas, productosMasVendidos] = await Promise.all([
			Ventas.aggregate([
				{
					$match: {
						$expr: {
							$eq: [{ $week: "$creado" }, { $week: hoy }],
						},
					},
				},
				{
					$group: {
						_id: "$dia",
						total: { $sum: "$total" },
					},
				},
			]),
			Ventas.aggregate([
				{
					$match: {
						$expr: {
							$eq: [{ $week: "$creado" }, { $week: hoy }],
						},
					},
				},
			]),
		]);

		const productosVentas = [];
		for (const venta of productosMasVendidos) {
			for (const producto of venta.productos) {
				productosVentas.push(producto);
			}
		}

		let productos = {};
		for (const producto of productosVentas) {
			productos[producto._id] = [...(productos[producto._id] || []), producto];
		}

		let productosOrdenados = [];
		for (const producto in productos) {
			let cantidades = productos[producto].reduce(
				(obj, producto) => {
					obj.vendidos += producto.resumen.cantidad;
					obj.total += producto.resumen.cantidad * producto.resumen.precio;
					return {
						_id: producto._id,
						nombre: producto.nombre,
						...obj,
					};
				},
				{ vendidos: 0, total: 0 }
			);

			productosOrdenados.push(cantidades);
		}
		productos = productosOrdenados
			.sort((a, b) => b.vendidos - a.vendidos)
			.slice(0, 5);
		res.status(200).json({ ventas, productos });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarVentas = async (req, res) => {
	try {
		let ventas;
		const hoy = new Date();
		ventas = await Ventas.find({
			$expr: { $eq: [{ $month: "$creado" }, { $month: hoy }] },
		});
		res.status(200).json(ventas);
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarVentasFecha = async (req, res) => {
	const { fechai, fechaf } = req.query;
	try {
		const ventas = await Ventas.find({
			$and: [
				{ creado: { $gte: new Date(`${fechai}T00:00:00.000+00:00`) } },
				{ creado: { $lte: new Date(`${fechaf}T23:59:59.999+00:00`) } },
			],
		});
		res.status(200).json(ventas);
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarVenta = async (req, res) => {
	try {
		const venta = await Ventas.findById(req.params.id).populate(
			"usuario",
			"-password"
		);
		if (!venta) return res.status(400).json({ msg: "No existe esa venta" });
		res.status(200).json(venta);
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe esa venta" });
	}
};

exports.eliminarVenta = async (req, res) => {
	try {
		const venta = await Ventas.findById(req.params.id);
		if (!venta) return res.status(400).json({ msg: "No existe esa venta" });

		await venta.delete();
		res.status(200).json({ _id: venta._id });
	} catch (error) {
		res.status(400).json({ msg: "No existe esa venta" });
	}
};

exports.editarVenta = async (req, res) => {
	const ventaNueva = req.body;

	try {
		const ventaAnterior = await Ventas.findById(req.params.id);
		if (!ventaAnterior)
			return res.status(400).json({ msg: "No existe esa venta" });

		if (req.usuario.rol === "EMPLEADO") {
			if (ventaAnterior.usuario.toString() !== req.usuario._id.toString())
				return res.status(400).json({ msg: "Acción no permitida" });
		}

		for await (const articulo of ventaAnterior.productos) {
			const producto = await Productos.findById(articulo._id);
			producto.cantidad += articulo.resumen.cantidad;
			producto.ganancias -= articulo.resumen.cantidad * articulo.resumen.precio;
			await producto.save();
		}

		for await (const articulo of ventaNueva.productos) {
			const producto = await Productos.findById(articulo._id);
			if (articulo.resumen.cantidad > producto.cantidad) {
				res.status(400).json({
					msg: `El Producto ${producto.nombre} excede la cantidad disponible`,
				});
				return;
			} else {
				producto.cantidad -= articulo.resumen.cantidad;
				producto.ganancias +=
					articulo.resumen.cantidad * articulo.resumen.precio;
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
