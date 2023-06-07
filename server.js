require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser")
const express = require("express")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express()
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const saltRounds = 10;
let currentAccount={}
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
    done(null, userObj.account.id); // Store only the user ID in the session
  });
  
  passport.deserializeUser((userId, done) => {
    Account.findOne({ id: userId })
      .exec()
      .then((account) => {
        done(null, { account });
      })
      .catch((error) => done(error));
  });


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
    id:String,
    first_name: String,
    last_name: String,
    date_of_birth:String,
    gender:String,
    country:String,
    Email: String,
    Password: String,
    Diet:{
    TypeOfdiet:String,
    glutenFree:Boolean,
    dairyFree:Boolean ,
    Vegetarian:Boolean ,
    Vegan:Boolean,
  }
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
        console.log(req.isAuthenticated());
        currentAccount=user.account
        console.log(user.account.id);
        return res.json({
          account: user.account,
          authentication: true,
        });
      });
    } else {
      console.log(user, info);
      // Authentication failed
      return res.json({
        authentication: false,
      });
    }
  })(req, res, next);
});

  app.get("/authenticationCheck",(req,res,next)=>{
    console.log("IN authentication check")
    res.json(req.isAuthenticated())
    
  })
  app.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      console.log(req.isAuthenticated())
      currentAccount={}
      res.json(req.isAuthenticated())
    });
  });

  app.get("/dashboard",(req,res,next)=>{
    console.log(currentAccount)
    res.json(currentAccount)
  })

  
app.post("/signup", async (req, res, next) => {
    Account.findOne({ Email: req.body.Email }).exec()
        .then((account) => {
            if (!account) {
                bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
                    const user = Account({
                        id:uuidv4(),
                        first_name: req.body.first_name,
                        last_name: req.body.lastname,
                        Email: req.body.Email,
                        Password: hash,
                        Diet: {
                          TypeOfdiet: 'No Diet restriction',
                          glutenFree: false,
                          dairyFree: false,
                          Vegetarian: false,
                          Vegan: false
                        }
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
app.put("/update",(req,res,next)=>{
  console.log(req.body)
  Account.findOneAndUpdate({ id: currentAccount.id },req.body,{new: true} )
  .then(updatedDoc => {
    currentAccount=updatedDoc
    res.json(updatedDoc)
    console.log('Updated document:', updatedDoc);
  })
  .catch(error => {
    console.error('Error updating document:', error);
  });

})

MongooseConnect().then
    (app.listen(PORT, () => {
        console.log(`Working in port ${PORT}`)
    }))