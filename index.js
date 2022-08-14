const express = require("express")
const session = require("express-session")
const geo = require("google-geocoder")

const app = express()
const port = 3000
const path = require("path")

const database = require("./database/database")

const categoriesController = require("./admin/categories/categoriesController")
const placesController = require("./admin/places/placesController")
const usersController = require("./admin/users/UsersController")

const Categories = require("./admin/categories/Categories")
const Places = require("./admin/places/Places")

app.use(session({
    secret: "asda123j12kjjksad",
    cookie: {
        maxAge: 7200000
    }
}))

database.authenticate()
.then(() => {
    console.log("Conexão ao servidor estabelecida com sucesso.")
})
.catch((err) => {
    console.log("Erro ao se autenticar ao banco de dados: " + err)
})

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use("/", categoriesController)
app.use("/", placesController)
app.use("/", usersController)
app.use("/tinymce", express.static(path.join(__dirname, "node_modules", "tinymce")))

app.get("/", (req, res) => {
    res.render("index")
})


app.get("/categories/:page", (req, res) => {
    const page = req.params.page
    let num = 0

    if(page <= 1 || isNaN(page)) {
        num = 0
    } else {
        num = (parseInt(page - 1)) * 4
    }

    Categories.findAndCountAll({
        order: [
            ["id", "DESC"]
        ],
        limit: 4,
        offset: num
    }).then((categories) => {
        let next = false

        if(num + 4 > categories.count) {
            next = false
        } else {
            next = true
        }

        res.render("categories", {
            categories: categories,
            next: next,
            page: parseInt(page)
        })
    })

})

app.get("/place/:slug", (req, res) => {
    const slug = req.params.slug

    Places.findOne({
        where: {
            slug: slug
        }
    }).then(async (place) => {
        await geo.find(place.address, (err, cb) => {
            location = cb[0].location
            res.render("placePage", {
                place: place,
                lat: location["lat"],
                long: location["lng"]
            })
        })
    })
})

app.get("/:categorieSlug/:page", (req, res) => {
    const categorieSlug = req.params.categorieSlug
    const page = req.params.page
    let num = 0

    if(page < 1 || isNaN(page)) {
        num = 0
    } else {
        num = (page - 1) * 4
    }

    Categories.findOne({
        where: {
            slug: categorieSlug
        }
    }).then((categorie) => {
        Places.findAndCountAll({
            where: {
                CategorieId: categorie.id
            },
            limit: 4,
            offset: num
        }).then((places) => {
            let next = false
            if(num + 4 > places.count) {
                next = false
            } else {
                next = true
            }

            res.render("places", {
                places: places,
                next: next,
                page: parseInt(page),
                categorie: categorie
            })
        })
    })

})

app.listen(port, () => {
    console.log("Servidor Rodando com Sucesso na Porta: " + port)
})

