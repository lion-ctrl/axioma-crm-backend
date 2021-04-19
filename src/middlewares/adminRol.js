const adminRol = (req,res,next) => {
    if (req.usuario.rol !== "ADMIN") {
        res.status(400).json({ msg: "Acceso no permitido" });
        return;
    }
    next();
}

module.exports = adminRol;
