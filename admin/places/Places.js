const Sequelize = require("sequelize")
const connection = require("../../database/database")

const Categories = require("../categories/Categories")

const Places = connection.define("Places", {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    address : {
        type: Sequelize.TEXT,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    }

})

Places.belongsTo(Categories)
Places.sync({force: false})

module.exports = Places