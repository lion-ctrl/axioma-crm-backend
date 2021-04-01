const Pedidos = require("../models/Pedidos");
const Productos = require("../models/Productos");

exports.nuevoPedido = async (req, res) => {
	const pedido = new Pedidos(req.body);
	try {
		pedido.costo += pedido.gastosExtras;
		await pedido.save();
		res.status(200).json({ msg: "Pedido creado correctamente" });
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarPedidos = async (req, res) => {
	try {
		const mes = new Date();
		const pedidos = await Pedidos.find({
			$expr: { $eq: [{ $month: "$creado" }, { $month: mes }] },
		});

		res.status(200).json(pedidos);
	} catch (error) {
		console.log(error);
	}
};

exports.mostrarPedido = async (req, res) => {
	try {
		const pedido = await Pedidos.findById(req.params.id);
		if (!pedido) return res.status(400).json({ msg: "No existe ese pedido" });

		res.status(200).json(pedido);
	} catch (error) {
		res.status(400).json({ msg: "No existe ese pedido" });
	}
};

exports.mostrarPedidosFecha = async (req, res) => {
	const { fechaInicial, fechaFinal } = req.body;
	try {
		const pedidos = await Pedidos.find({
			$and: [
				{ creado: { $gte: new Date(`${fechaInicial}T00:00:00.000+00:00`) } },
				{ creado: { $lte: new Date(`${fechaFinal}T00:59:59.999+00:00`) } },
			],
		});
		res.status(200).json(pedidos);
	} catch (error) {
		console.log(error);
	}
};

exports.eliminarPedido = async (req, res) => {
	try {
		const pedido = await Pedidos.findById(req.params.id);
		if (!pedido) return res.status(400).json({ msg: "No existe ese pedido" });
		if (pedido.estado.trim() === "COMPLETADO") {
			for await (const articulo of pedido.productos) {
				const producto = await Productos.findById(articulo._id);
				for (let i = 0; i < producto.pedidos.length; i++) {
					console.log(producto.pedidos[i]._id);
					console.log(pedido._id.toString());
					if (producto.pedidos[i]._id == pedido._id.toString()) {
						producto.pedidos.splice(i,1);
						break;
					}
				}
				await producto.save();
			}
		}

		await pedido.delete();

		res.status(200).json({ msg: "Pedido Eliminado" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe ese pedido" });
	}
};

exports.actualizarPedido = async (req, res) => {
	try {
		const pedido = await Pedidos.findById(req.params.id);
		if (!pedido) return res.status(400).json({ msg: "No existe ese pedido" });

		if (pedido.estado === "COMPLETADO") {
			return res.status(400).json({
				msg: "No se puede actualizar un pedido que ya esta como Completado",
			});
		}

		const pedidoActualizado = await Pedidos.findByIdAndUpdate(
			{ _id: req.params.id },
			req.body,
			{ new: true }
		);

		res.status(200).json(pedidoActualizado);
	} catch (error) {
		res.status(400).json({ msg: "No existe ese pedido" });
	}
};

exports.pedidoCompletado = async (req, res) => {
	try {
		const pedido = await Pedidos.findById(req.params.id);
		if (!pedido) return res.status(400).json({ msg: "No existe ese pedido" });

		if (pedido.estado === "COMPLETADO") {
			return res.status(400).json({msg:"Ese pedido ya esta como completado"})
		}

		pedido.estado = "COMPLETADO";

		for await (const articulo of pedido.productos) {
			const producto = await Productos.findById(articulo._id);

			const costo = articulo.cantidad * articulo.precioCosto;
			producto.costoTotal = producto.costoTotal + costo;
			producto.cantidad += articulo.cantidad;
			producto.pedidos.push({ _id: pedido._id, cantidad: articulo.cantidad, total: articulo.cantidad });

			await producto.save();
		}
		await pedido.save();
		res.status(200).json({ msg: "Pedido Completado" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "No existe ese pedido" });
	}
};
