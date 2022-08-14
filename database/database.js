const Sequelize = require("sequelize")
require("dotenv").config()

const connection = new Sequelize("akiaxa", process.env.USER, process.env.PASS, {
    host : "localhost",
    dialect: "mysql"
})

module.exports = connection