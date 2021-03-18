const jwt = require("jsonwebtoken");

const checkAuth = function (req,res,next) {
    const token = req.header("Authorizations");

    if(!token) return res.status(400).json({msg: "Acesso no permitido"})

    try {
        const cifrado = jwt.verify(token,process.env.SECRETA);
        req.usuarioId = cifrado._id;
        next();
    } catch (error) {
        res.status(400).json({msg:"Sesion terminada, vuelve a iniciar Sesion"})
    }
}

module.exports = checkAuth;