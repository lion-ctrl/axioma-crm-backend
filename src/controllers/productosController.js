const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

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
			file.mimetype === "image/jpg" ||
			file.mimetype === "image/gif" 
		) {
			cb(null, true);
		} else {
			cb(new Error("Formato no Valido"));
		}
	},
	limits: { fileSize: 100000 }
}

const upload = multer(configuracionMulter).single("imagen");

exports.subirImagen = (req, res, next) => {
	upload(req, res, function (error) {
		if (error) {
			if (error instanceof multer.MulterError) {
				if (error.code === "LIMIT_FILE_SIZE") {
					return res.json({ msg: "Imagen muy pesada, maximo 100KB" });
				} else {
					return res.json({ msg: error.message });
				}
			} else if (error.hasOwnProperty("message")) {
				return res.json({ msg: error.message });
			}
		}
		next();
	});
};

exports.nuevoProducto = async (req,res) => {
    console.log(req.body);
    // try {
        
    // } catch (error) {
        
    // }
}

exports.mostrarProductos = async (req,res) => {

}

exports.mostrarProducto = async (req,res) => {

}

exports.actualizarProducto = async (req,res) => {

}

exports.eliminarProducto = async (req,res) => {

}