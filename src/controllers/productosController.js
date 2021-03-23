const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
const slug = require("slug");

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
	let producto = await Productos.findOne({ nombre: req.body.nombre });
	if (producto) return res.status(400).json({ msg: "Ya Existe ese producto" });
	producto = new Productos(req.body);
	try {
		if (req.file) {
			producto.imagen = req.file.filename;
		}
		producto.costoTotal = producto.cantidad * producto.precioCosto;
		producto.slug = slug(`${producto.nombre}-${shortid.generate()}`);
		await producto.save();
		res.status(200).json(producto);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Hubo un error" });
	}
};

exports.mostrarProductos = async (req, res) => {
	const productos = await Productos.find({});
	res.status(200).json(productos);
};

exports.mostrarProducto = async (req, res) => {
	try {
		const producto = await Productos.findById(req.params.id);
		if (!producto) {
			res.json({ msg: "Ese producto no existe" });
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
			nombre: nuevoProducto.nombre,
		});
		if (productoNombre) {
			if (productoNombre._id.toString() !== producto._id.toString()) {
				res.status(400).json({ msg: "Ya esta registrado ese producto" });
				return;
			}
		}
		if (req.file) {
			nuevoProducto.imagen = req.file.filename;
		} else {
			nuevoProducto.imagen = producto.imagen;
		}
		nuevoProducto.slug = slug(`${nuevoProducto.nombre}-${shortid.generate()}`);
		nuevoProducto.costoTotal =
			nuevoProducto.cantidad * nuevoProducto.precioCosto;
		await Productos.findByIdAndUpdate({ _id: req.params.id }, nuevoProducto);
		res.status(200).json({ msg: "Producto Actualizado" });
	} catch (error) {
		console.log(error);
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
		await Productos.findByIdAndDelete(req.params.id);
		res.json({ msg: "Producto Eliminado Correctamente" });
	} catch (error) {
		res.status(400).json({ msg: "Ese producto no existe" });
	}
};
