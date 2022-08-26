const express = require("express");
const router = express.Router()

const bodyParser = require("body-parser")
const authUser = require("../../middlewares/authenticate")
router.use(bodyParser.urlencoded({extended: true}))


const bcrypt = require("bcrypt")

const User = require("./User")

router.get("/admin/users", authUser, (req, res) => {

    User.findAll().then((users) => {
        res.render("users/admin/home", {
            users: users
        })
    })

})

router.get("/create", (req, res) => {
    res.render("users/admin/new")
})

router.get("/login", (req, res) => {
    res.render("users/admin/login")
})

router.get("/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

router.post("/authenticate", (req, res) => {
    
    const email = req.body.email
    const password = req.body.pass

    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if(user != undefined) { // if exist a user with this email
            var correct = bcrypt.compareSync(password, user.password) // pass validation
            if(correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin")
            } else {
                res.redirect("/login")
            }
        } else {
            res.redirect("/login")
        }
    })

})

router.post("/users/new", (req, res) => {
    const email = req.body.email
    const password = req.body.pass

    const salt = 10
    const pass = bcrypt.hashSync(password, salt)

    console.log("Tá vindo pra q pelo menjos?")

    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if(user == undefined) {
            User.create({
                email: email,
                password: pass
            }).then(() => {
                res.redirect("/admin/users")
            }).catch(() => {
                res.redirect("/admin/users/create")
            }) 
        } else {
            res.redirect("/admin/users/create")
        }
    })

})

module.exports = router
