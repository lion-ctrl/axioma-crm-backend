const router = require("express").Router();

const authController = require("../controllers/authController");

router.get("/",authController.autenticarUsuario)

module.exports = router;