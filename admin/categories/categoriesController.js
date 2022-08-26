const express = require("express")
const router = express.Router()
const Categories = require("./Categories")
const authUser = require("../../middlewares/authenticate")
const bodyParser = require("body-parser")
router.use(bodyParser.urlencoded({extended: true}))

const multer = require("multer")
const path = require("path")
const sharp = require("sharp")
const fs = require("fs")
const slug = require("slugify")


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/uploads/")
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

router.get("/admin", authUser, (req, res) => {
    res.render("categories/index")
})

router.get("/admin/categories", authUser, (req, res) => {

    Categories.findAll({
        order: [
            ["id", "DESC"]
        ]
    }).then((categories) => {
        res.render("categories/admin/home", {
            categories: categories
        })
    })
    
})

router.get("/admin/categories/new", authUser, (req, res) => {
    res.render("categories/admin/new")
})

router.get("/admin/categories/edit/:id", authUser,(req, res) => {
    const id = req.params.id

    Categories.findOne({
        where: {
            id: id
        }
    }).then((categorie) => {
        res.render("categories/admin/edit", {
            categorie: categorie
        })
    })

})

router.post("/categories/create", upload.single("image"), async (req, res) => {
    const title = req.body.title
    const image = req.file.filename
    
    await sharp(req.file.path)
    .resize(300, 250)
    .jpeg({quality: 90})
    .toFile(
        path.resolve(req.file.destination, "resized", "categories", req.file.filename)
    )
    fs.unlinkSync(req.file.path)

    Categories.create({
        title: title, 
        image: image,
        slug: slug(title, {
            lower: true
        })
    }).then(() => {
        res.redirect("/admin/categories")
    })

})

router.post("/categorieEdit", upload.single("image"), (req, res) => {    
    const id = req.body.id
    const title = req.body.title
    const image = req.file?.filename

    let newImage = ""
    
    Categories.findOne({
        where: {
            id: id
        }
    }).then(async (categorie) => {
        if(image == undefined) {
            newImage = categorie.image
        } else {
            if(image != categorie.image) {
                newImage = image
    
                await sharp(req.file.path)
                .resize(300, 250)
                .jpeg({quality: 90})
                .toFile(
                    path.resolve(req.file.destination, "resized", "categories", req.file.filename)
                )
    
                fs.unlinkSync(path.resolve(process.cwd(), "public","uploads", "resized", "categories", categorie.image))
                fs.unlinkSync(req.file.path)

            }
        }

        Categories.update({
            title: title,
            image: newImage
        }, {
            where: {
                id:id
            }
        }).then(() => {
            res.redirect("/admin/categories")
        })

    })
})

router.post("/deleteCategorie", (req, res) => {
    const id = req.body.id

    Categories.findByPk(id).then((categorie) => {
        Categories.destroy({
            where: {
                id: id
            }
        }).then(() => {
            fs.unlinkSync(path.resolve(process.cwd(), "public","uploads", "resized", "categories", categorie.image))
            res.redirect("/admin/categories")
        })
    })

})

module.exports = router