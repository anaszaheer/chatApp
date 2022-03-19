require('dotenv').config()
const router = require('express').Router();
const User = require("../models/User");
const Msg = require("../models/Message");
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { reqAuthentication, reqNotAuthentication } = require('./verifyTokens');
const cookieParser = require('cookie-parser');

router.use(cookieParser());

//index(get)
router.get('/index', reqAuthentication, (req, res) => {

    const token = req.cookies.jwt;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedUser) => {

        console.log("User logged in", decodedUser.username);

        User.find({username:{$ne:decodedUser.username}}, function (err, data) {

            if (err) {
                console.log(err);
                res.send(err);
            }

            if (data) {
                let allUsers = [];

                for (var key in data) {
                    allUsers.push(data[key].username);
                }

                res.render('index', { data: allUsers });
            }
        })
    })
})

//index(post)
router.post('/index', reqAuthentication, (req, res) => {

    const token = req.cookies.jwt;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {

        if (err) {
            console.log(err);
            res.send(err);
        }

        if (data) {
            var selectedOpt = encodeURIComponent(req.body.selectOpt)
            res.redirect('/api/chat?valid=' + selectedOpt);
        }
    });

});


//chat(get)
router.get('/chat', reqAuthentication, async (req, res) => {

    //getting token from cookie here
    const token = req.cookies.jwt;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            res.render('error');
        }
        if (data) {
            res.render('chat', { chattingWith: req.query.valid });

        }
    });
})


//login (get)
router.get('/', reqNotAuthentication, (req, res) => {
    res.render('login');
})

//login validation
const loginSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(4).required(),
});

//login (post)
router.post('/',  reqNotAuthentication, async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        //validating
        const { error } = loginSchema.validate(req.body);
        if (error) return res.render('login', {error: error.details[0].message});

        //finding user
        const user = await User.findOne({ username: username });
        if (!user) return res.render('login', {error: 'Credentials entered are incorrect.'});

        //user correct or not (hasing) 
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.render('login', {error: 'Credentials entered are incorrect.'});

        // if validPassword return true then send 
        if (validPassword) {

            // create and assign json web token
            user.token;
            await user.save((err, user) => {
                if (err) throw err;

                jwt.sign({ username: user.username }, process.env.TOKEN_SECRET, (err, token) => {

                    let oneDay = 86400000;

                    //setting token to browser cookies to save in local storage
                    res.cookie('jwt', token, { maxAge: oneDay, httpOnly: true }) //1s = 1000

                    console.log('JWT is in browser cookie');

                    //redirecting
                    res.redirect('/api/index');
                });

            });
            // res.send({token: token});   
        }

    } catch (error) {

        res.status(400).send("Invalid" + error);

    }
});

router.get('/register', reqNotAuthentication, (req, res) => {
    res.render('register');
})

//validation
const regSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(4).required(),
    cpassword: Joi.string().min(4).required(),
});

router.post('/register', reqNotAuthentication, async (req, res) => {

    //applying validation
    const { error } = regSchema.validate(req.body);
    if (error) return res.render('register', {error: error.details[0].message});

    //check if username is already in database
    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist) return res.render('register', {error: 'This username already exists. Please try another.'});

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {

            //hashing password
            const hashedPassword = await bcrypt.hash(req.body.password, 12);

            const registerEmployee = new User({
                username: req.body.username,
                password: hashedPassword,
                token: jwt.sign({ username: req.body.username }, process.env.TOKEN_SECRET)
            })
            const registered = await registerEmployee.save((err, user) => {
                if (err) throw err;

                jwt.sign({ username: user.username }, process.env.TOKEN_SECRET, (err, token) => {

                    let oneDay = 86400000;

                    //setting token to browser cookies to save in local storage
                    res.cookie('jwt', token, { maxAge: oneDay, httpOnly: true })

                    console.log('JWT is in browser cookie');

                    //redirecting
                    res.redirect('/api/');
                });
            });
        }
        else {
            res.render('register', {error: 'Passwords do not match. Please try again.'});
        }

    } 
    catch (error) {
        res.render('register', {error: error});;
    }
})

router.get('/clear', function (req, res) {
    Msg.deleteMany({}).then(function () {
        var selectedOpt = encodeURIComponent(req.body.selectOpt);
        res.redirect('/api/chat?valid=' + selectedOpt);
    }).catch(function (error) {
        res.send(error); // Failure
    });
});

router.get('/logout', function (req, res) {
    res.status(202).clearCookie('jwt');
    res.redirect('/api/');
});

module.exports = router;