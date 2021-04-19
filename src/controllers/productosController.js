const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
const slug = require("slug");
const fs = require("fs");

const Productos = require("../models/Productos");

const configuracionMulter = {
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.join(__dirname + "/../public/uploads/productos"));
		},
		filename: (req, file, next) => {
			const extension = file.mimetype.split("/")[1];
			next(null, `${shortid.generate()}.${extension}`);
		},
	}),
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype === "image/jpeg" ||
			file.mimetype === "image/png" ||
			file.mimetype === "image/jpg"
		) {
			cb(null, true);
		} else {
			cb(new Error("Formato no Valido"));
		}
	},
	limits: { fileSize: 100000 },
};

const upload = multer(configuracionMulter).single("imagen");

exports.subirImagen = (req, res, next) => {
	upload(req, res, function (error) {
		if (error) {
			if (error instanceof multer.MulterError) {
				if (error.code === "LIMIT_FILE_SIZE") {
					return res
						.status(400)
						.json({ msg: "Imagen muy pesada, maximo 100KB" });
				} else {
					return res.status(400).json({ msg: error.message });
				}
			} else if (error.hasOwnProperty("message")) {
				return res.status(400).json({ msg: error.message });
			}
		}
		next();
	});
};

exports.nuevoProducto = async (req, res) => {
	let producto = await Productos.findOne({
		nombre: req.body.nombre.toLowerCase(),
	});
	if (producto) {
		if (req.file) {
			const rutaImagen = path.resolve(
				`./src/public/uploads/productos/${req.file.filename}`
			);
			fs.unlink(rutaImagen, (error) => {
				if (error) {
					console.log(error);
				}
				return;
			});
		}
		return res.status(400).json({ msg: "Ya Existe ese producto" });
	}
	producto = new Productos(req.body);
	try {
		if (req.file) {
			producto.imagen = req.file.filename;
		}
		producto.costoTotal = producto.cantidad * producto.precioCosto;
		producto.slug = slug(`${producto.nombre}-${shortid.generate()}`);
		producto.nombre = producto.nombre.toLowerCase();
		await producto.save();
		res.status(200).json({ msg: "Producto Creado" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Hubo un error" });
	}
};

exports.mostrarProductos = async (req, res) => {
	try {
		let productos;
		if (req.query.hasOwnProperty("gastos")) {
			productos = await Productos.find({})
				.sort({ creado: -1 })
				.select("_id precioCosto nombre");
		} else if(req.query.hasOwnProperty("ventas")) {
			productos = await Productos.find({cantidad: {$gt: 0}})
				.sort({ creado: -1 })
				.select("_id precioVenta nombre cantidad");
		} else {	
			productos = await Productos.find({}).sort({ creado: -1 });
		}
		res.status(200).json(productos);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarProductosCategoria = async (req, res) => {
	const { categoria } = req.params;
	try {
		const productos = await Productos.find({ categoria })
			.select("-pedidos")
			.sort({ creado: -1 });
		res.status(200).json(productos);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Error en el servidor" });
	}
};

exports.mostrarProducto = async (req, res) => {
	try {
		const producto = await Productos.findOne({ slug: req.params.slug }).select(
			"-pedidos"
		);
		if (!producto) {
			res.status(400).json({ msg: "Ese producto no existe" });
			return;
		}
		res.json(producto);
	} catch (error) {
		console.log(error);
	}
};

exports.actualizarProducto = async (req, res) => {
	const nuevoProducto = req.body;
	try {
		const producto = await Productos.findOne({ _id: req.params.id });
		if (!producto) {
			res.status(400).json({ msg: "Ese producto no existe" });
			return;
		}

		const productoNombre = await Productos.findOne({
			nombre: nuevoProducto.nombre.toLowerCase(),
		});
		if (productoNombre) {
			if (productoNombre._id.toString() !== producto._id.toString()) {
				res.status(400).json({ msg: "Ya esta registrado ese producto" });
				return;
			}
		}

		if (req.file) {
			if (producto.imagen) {
				const rutaImagen = path.resolve(
					`./src/public/uploads/productos/${producto.imagen}`
				);
				fs.unlink(rutaImagen, (error) => {
					if (error) {
						console.log(error);
					}
					return;
				});
			}
			nuevoProducto.imagen = req.file.filename;
		} else {
			if (producto.imagen) {
				nuevoProducto.imagen = producto.imagen;
			}
		}

		nuevoProducto.slug = slug(`${nuevoProducto.nombre}-${shortid.generate()}`);

		if (nuevoProducto.cantidad && nuevoProducto.precioCosto) {
			nuevoProducto.costoTotal =
				nuevoProducto.cantidad * nuevoProducto.precioCosto;
		}

		await Productos.findByIdAndUpdate({ _id: req.params.id }, nuevoProducto);
		res.status(200).json({ msg: "Producto Actualizado" });
	} catch (error) {
		res.status(400).json({ msg: "Ese producto no existe" });
	}
};

exports.eliminarProducto = async (req, res) => {
	try {
		const producto = await Productos.findOne({ _id: req.params.id });
		if (!producto) {
			res.status(400).json({ msg: "Ese producto no existe" });
			return;
		}
		if (producto.imagen) {
			const rutaImagen = path.resolve(
				`./src/public/uploads/productos/${producto.imagen}`
			);
			fs.unlink(rutaImagen, (error) => {
				if (error) {
					console.log(error);
				}
				return;
			});
		}
		await producto.delete();
		res.json({ _id: producto._id });
	} catch (error) {
		console.log(error);
		res.status(400).json({ msg: "Ese producto no existe" });
	}
};
