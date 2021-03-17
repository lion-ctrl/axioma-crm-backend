const mongoose = require('mongoose');
require("dotenv").config({ path: "variables.env" });

async function conectarDB() {
    try {
        await mongoose.connect(process.env.DB_MONGO,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useFindAndModify:false,
            useCreateIndex:true
        });
        console.log("BD Conectada");
    } catch (error) {
        console.log("Hubo un error");
        console.log(error);
    }
}

module.exports = conectarDB;