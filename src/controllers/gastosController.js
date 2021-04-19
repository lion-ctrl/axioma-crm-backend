const Gastos = require("../models/Gastos");
const Productos = require("../models/Productos");

exports.nuevoGasto = async (req, res) => {
	const gasto = new Gastos(req.body);
	try {
		if (gasto.productos) {
			for await (const articulo of gasto.productos) {
				const producto = await Productos.findById(articulo._id);

				const costo = articulo.resumen.cantidad * articulo.resumen.precio;
				producto.costoTotal = producto.costoTotal + costo;
				producto.cantidad += articulo.resumen.cantidad;
				await producto.save();
			}
		}
		await gasto.save();
		res.status(200).json({ msg: "Gasto creado correctamente" });
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarGastos = async (req, res) => {
	try {
		const mes = new Date();
		const pedidos = await Gastos.find({
			$expr: { $eq: [{ $month: "$creado" }, { $month: mes }] },
		}).sort({ creado: -1 });

		res.status(200).json(pedidos);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarGasto = async (req, res) => {
	try {
		const pedido = await Gastos.findById(req.params.id);
		if (!pedido) return res.status(400).json({ msg: "No existe ese gasto" });

		res.status(200).json(pedido);
	} catch (error) {
		res.status(400).json({ msg: "No existe ese gasto" });
	}
};

exports.mostrarGastosFecha = async (req, res) => {
	const { fechai, fechaf } = req.query;
	try {
		const gastos = await Gastos.find({
			$and: [
				{ creado: { $gte: new Date(`${fechai}T00:00:00.000+00:00`) } },
				{ creado: { $lte: new Date(`${fechaf}T23:59:59.999+00:00`) } },
			],
		});
		res.status(200).json(gastos);
	} catch (error) {
		console.log(error);
		res.status(400).json({msg: "Error en el servidor"});
	}
};

exports.eliminarGasto = async (req, res) => {
	try {
		const gasto = await Gastos.findById(req.params.id);
		if (!gasto) return res.status(400).json({ msg: "No existe ese gasto" });

		await gasto.delete();

		res.status(200).json(gasto);
	} catch (error) {
		res.status(400).json({ msg: "No existe ese gasto" });
	}
};

exports.editarGasto = async (req, res) => {
	const {productos} = req.body;
	try {
		const gasto = await Gastos.findById(req.params.id);
		if (!gasto) return res.status(400).json({ msg: "No existe ese gasto" });

		for await (const articulo of gasto.productos) {
			const producto = await Productos.findById(articulo._id);
			const costo = articulo.resumen.cantidad * articulo.resumen.precio;
			producto.costoTotal -= costo;
			producto.cantidad -= articulo.resumen.cantidad;
			await producto.save();
		}

		for await (const articulo of productos) {
			const producto = await Productos.findById(articulo._id);
			const costo = articulo.resumen.cantidad * articulo.resumen.precio;
			producto.costoTotal += costo;
			producto.cantidad += articulo.resumen.cantidad;
			await producto.save();
		}

		await Gastos.findByIdAndUpdate(
			{ _id: req.params.id },
			req.body,
			{ new: true }
		);

		res.status(200).json({msg:"Gasto actualizado"});
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe ese gasto" });
	}
};
