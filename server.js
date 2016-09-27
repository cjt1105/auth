const express = require('express');
const app = express();
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const MongoUrl = 'mongodb://localhost:27017/auth';
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
mongoose.Promise = Promise

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    'store': new RedisStore(),
    'secret': 'goatman8'
}))

app.use((req,res,next) => {
    if(req.session.email){
    app.locals.email = req.session.email;
    console.log('sess', req.session)
    }
    next()
})

app.get('/', (req, res) => {
    console.log("heyyyyyyy", req.session)
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        if(user){
            return new Promise((resolve, reject)=>{
                 bcrypt.compare(password, user.password, (err, match) => {
                if(res) {
                    resolve(match)
                }
                if (err) {
                    reject(err)
                }
            } )
            })
            .then(()=> {
                req.session.email = user.email;
            })
        } else {
            const email = req.body.email;
            const password = req.body.password;
            bcrypt.hash(password, 5, (err,hash)=> {
                const newUser = new User({
                    email: email,
                    password: hash
                })
                newUser.save((err) => {

                })
            })
        }
    })
    .then(()=>{
        console.log(app.get('email'));
        res.redirect('/')
    })
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 5, (err,hash)=> {
        const newUser = {
            email: email,
            password: hash
        }
        User.create(newUser, (err, user) => {
            console.log(user);
            req.session.email = user.email
        })
    })
    res.redirect('/')
})

mongoose.connect(MongoUrl, ()=>{
    app.listen(3000, () => {
        console.log('listening on port 3000')
    })
})