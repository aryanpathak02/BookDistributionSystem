require('dotenv').config();
const express = require("express");
const app = express();
const port = 8080;
const path = require('path');
const User = require("./Models/User");
const userRoute = require("./Router/userRoute");
const bookRoute = require("./Router/booksRoute");
const transactionRoute = require("./Router/transcationRoute");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const ejsMate = require('ejs-mate');
const dbUrl =process.env.dburl ;


const mongoose = require('mongoose');

main().then(res => console.log(`Connect successfully`))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.engine('ejs', ejsMate);

// Setting the ejs 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:  process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Session store error:", err);  
});


app.use(express.urlencoded({ extended: true })); 
app.use(session({
    secret:  process.env.SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
    store
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
});

app.use('/',userRoute);
app.use('/books',bookRoute);
app.use('/transaction',transactionRoute);

app.get("/",(req,res)=>{
   res.send(`hi , this is root `);
});

app.use((err, req, res, next) => {
    const { status = 500, message = `Something Wrong Happened` } = err;
    res.status(status).render("error", { message });
});

app.listen(port,()=>{
    console.log(`The app is listing at port number ${port}`);
});

