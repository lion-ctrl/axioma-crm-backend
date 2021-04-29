const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config({ path: "variables.env" });

const app = express();

// ? BD
require("./config/db")();

// ? configuraciones
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var whitelist = [process.env.APP_FRONT_END_URL];
var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};
app.use(cors(corsOptions));
app.use(morgan("dev"));

// ? Archivos Estaticos
app.use(express.static(path.join(__dirname, "public")));

// ? rutas
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/negocio", require("./routes/negocio.routes"));
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/categorias", require("./routes/categorias.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/gastos", require("./routes/gastos.routes"));

app.listen(app.get("port"), function () {
	console.log("Server on Port", app.get("port"));
});
