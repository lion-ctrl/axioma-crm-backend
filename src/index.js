const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: "variables.env" });

const app = express();

// ? BD
require("./config/db")();

// ? configuraciones
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(cors());

// ? Archivos Estaticos
app.use(express.static(path.join(__dirname, "public")));

// ? rutas
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/productos", require("./routes/productos.routes"));

app.listen(app.get("port"), function () {
	console.log("Server on Port", app.get("port"));
});
