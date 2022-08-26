const express = require("express")
const router = express.Router()

const multer = require("multer")
const sharp = require("sharp")
const path = require("path")
const slugify = require("slugify")
const fs = require("fs")

const Categories = require("../categories/Categories")
const Places = require("./Places")

const bodyParser = require("body-parser")
router.use(bodyParser.urlencoded({extended: true}))

const authUser = require("../../middlewares/authenticate")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/uploads/")
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

router.get("/admin/places", authUser,(req, res) => {
    
    Places.findAll({
        order: [
            ["id", "DESC"]
        ]
    }).then((places) => {
        res.render("places/admin/home", {
            places: places
        })
    })

})

router.get("/admin/places/new", authUser,(req, res) => {

    Categories.findAll({
        order: [
            ["id", "DESC"]
        ]
    }).then((categories) => {
        res.render("places/admin/new", {
            categories: categories
        })
    })
    
})

router.get("/admin/places/edit/:id", authUser,(req, res) => {
    const id = req.params.id

    Places.findByPk(id).then((place) => {
        Categories.findAll().then((categories) => {
            res.render("places/admin/edit", {
                place: place,
                categories: categories
            })
        })
    })

})

router.post("/places/create", upload.single("image"), async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const slug = slugify(title, {
        lower: true
    })
    const image = req.file.filename
    const address = req.body.address
    const phone = req.body.phone
    const categorieId = req.body.categorieId

    await sharp(req.file.path)
    .resize(300, 250)
    .jpeg({quality: 90})
    .toFile(
        path.resolve(req.file.destination, "resized", "places", req.file.filename)
    )
    fs.unlinkSync(req.file.path)

    Places.create({
        title: title,
        description: description,
        slug: slug,
        image: image,
        address: address,
        phone: phone,
        CategorieId: categorieId
    }).then(() => {
        res.redirect("/admin/places")
    })

})

router.post("/place/delete", (req, res) => {
    const id = req.body.id

    Places.findByPk(id).then((place) => {
        Places.destroy({
            where: {
                id: id
            }
        }).then(() => {
            fs.unlinkSync(path.resolve(process.cwd(), "public", "uploads", "resized", "places", place.image))
            res.redirect("/admin/places")
        })
    })

})

router.post("/places/edit", upload.single("image"), (req, res) => {
    const id = req.body.id
    const title = req.body.title
    const description = req.body.description
    const slug = slugify(title, {
        lower: true
    })
    const image = req.file?.filename
    const address = req.body.address
    const phone = req.body.phone
    const categorie = req.body.categorieId

    let newImage = ""

    Places.findByPk(id).then(async (place) => {
        
        if(image == undefined) {
            newImage = place.image
        } else {
            if(image != place.image) {
                newImage = image

                await sharp(req.file.path)
                .resize(300, 250)
                .jpeg({quality: 90})
                .toFile(
                    path.resolve(req.file.destination, "resized", "places", req.file.filename)
                )
                fs.unlinkSync(path.resolve(process.cwd(), "public","uploads", "resized", "places", place.image))
                fs.unlinkSync(req.file.path)
            }
        }

        place.update({
            title: title,
            description: description,
            slug: slug,
            image: image,
            address: address,
            phone: phone,
            categorie: categorie
        }).then(() => {
            res.redirect("/admin/places")
        })

    })

})

module.exports = router