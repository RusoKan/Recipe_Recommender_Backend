require('dotenv').config()

const bodyParser = require("body-parser")
const express = require("express")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express()
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors())
PORT = process.env.PORT || 3000

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}))

app.use(passport.initialize())

app.use(passport.session())



const authUser = (email, password, done) => {
    Account.findOne({ Email: email }).exec()
        .then((account) => {
            if (account) {
                bcrypt.compare(password, account.Password).then(function (result) {
                    if (result) {
                        done(null, { account }, { message: "Succesfull" })

                    }
                    else {
                        // console.log("Check  password again",)      
                        done(null, false, { message: "Invalid password" })

                    }
                })
            }
            else {
                // console.log("Check your email ",)
                done(null, false, { message: "Invalid password" })
            }

        })
        .catch((error) => done(error));

    ;


}
passport.use(new LocalStrategy({
    usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password'
},authUser))
passport.serializeUser((userObj, done) => {
    done(null, userObj)
})
passport.deserializeUser((userObj, done) => {
    done(null, userObj)
})


const { Schema, model } = mongoose;
const MongooseConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODBBKEY);
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }


}
const user_accounts = new Schema({
    first_name: String,
    last_name: String,
    Email: String,
    Password: String
})
const Account = model("Account", user_accounts)

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (user) {
        req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
        console.log(user, info);
        console.log(req.isAuthenticated())
        return res.json(true);
        
      }
         ) 
    }else {
        console.log(user, info);
        // Authentication failed
        return res.json(false);
      }
    })(req, res, next);
  });

  app.get("/dashboard",(req,res,next)=>{
    res.json(req.isAuthenticated())

  })
  app.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      console.log(req.isAuthenticated())
      res.json(req.isAuthenticated())
    });
  });
  
// app.post("/login", (req, res, next) => {
//     passport.authenticate("local", (err, user, info) => {
//       if (user) {
//         return res.json(true);
//       } else {
//         console.log(user, info)
//         // Authentication failed
//         return res.json(false);
//       }
//     })(req, res, next);
//   });

// app.post("/login", (req, res, next) =>

// {passport.authenticate("local",(err, user, info) =>
//         {
//             console.log("hello")
//             if (user) {
//                 return res.json(true);
//               }
//               else 
//               {
//                 // Authentication failed
//                 return res.json(false);
//               }
//         }
//     )}
// )
// app.get("/dashboard", (req, res, next) => {
//     if (req.isAuthenticated())
//         console.log("I'm Here")
//     else {
//         res.redirect("/login")
//     }


// })




app.post("/signup", async (req, res, next) => {
    Account.findOne({ Email: req.body.Email }).exec()
        .then((account) => {
            if (!account) {
                bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
                    const user = Account({
                        first_name: req.body.first_name,
                        last_name: req.body.lastname,
                        Email: req.body.Email,
                        Password: hash,
                    })
                    user.save()
                });

                console.log("User Created");
                const Accountexist = false
                res.json(Accountexist)
            }
            else {
                console.log("Account Exist")
                const Accountexist = true
                res.json(Accountexist)
            }

        })



})


MongooseConnect().then
    (app.listen(PORT, () => {
        console.log(`Working in port ${PORT}`)
    }))