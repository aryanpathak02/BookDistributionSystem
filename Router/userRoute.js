const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../Models/User");


router.get('/login',(req,res)=>{
    res.render("./user/login");
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login',failureFlash: true }),
    function (req, res) {
        res.redirect("/dashboard")
    });

router.get('/signup',(req,res)=>{
    res.render("./user/signup");
});

router.post('/signup',async (req,res)=>{
    try {
        let { username, email, password } = req.body;
        let newUser = new User({
            username: username,
            email: email
        });

        let registerUser = await User.register(newUser, password);

        req.login(registerUser, (err) => {
            if (err) {
                throw err;
            }
            
            res.render("./dasboard")
        });
    } catch (e) {
        res.redirect("/signup");
    }
})

router.get("/dashboard",(req,res)=>{
    res.render("./dashboard");
});

router.get('/users', async (req, res) => {
    const users = await User.find();
    res.render("./User/showAllUser",{users});
});



module.exports = router;