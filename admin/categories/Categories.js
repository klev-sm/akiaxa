const Sequelize = require("sequelize")
const connection = require("../../database/database")

const Categories = connection.define("Categorie", {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

Categories.sync({force: false})

module.exports = Categories