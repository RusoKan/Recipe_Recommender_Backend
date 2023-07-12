require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser")
const express = require("express")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const app = express()
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const axios= require("axios")
const saltRounds = 10;
let currentAccount={}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors({
  origin:"http://localhost:5173",
  methods:"GET,POST,PUT,DELETE",
  credentials:true,

}))
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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
},
function(accessToken, refreshToken, profile, cb) {
  Account.findOrCreate({ id:`G-${profile.id}`,Email:profile.emails[0].value}, 
  function (err, user) {
    ProfileAuth=profile
    currentAccount=user
    return cb(err, user);
  });
}
));

// passport.serializeUser((userObj, done) => {
//   console.log("MY INFO",userObj)
//     done(null, userObj.account.id); // Store only the user ID in the session
//   });
  
//   passport.deserializeUser((userId, done) => {
//     Account.findOne({ id: userId })
//       .exec()
//       .then((account) => {
//         done(null, { account });
//       })
//       .catch((error) => done(error));
//   });
passport.serializeUser((user,done)=>{
  done(null,user)
})
passport.deserializeUser((user,done)=>{
  done(null,user)
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
    id:String,
    first_name: String,
    last_name: String,
    date_of_birth:String,
    gender:String,
    country:String,
    Email: String,
    Password: String,
    MyRecipes:[String],
    Diet:{
    TypeOfdiet:String,
    glutenFree:Boolean,
    dairyFree:Boolean ,
    Vegetarian:Boolean ,
    Vegan:Boolean,
  },
  Reviews:[{
    RecipeId:String,
    ratingStar:Number,
    ratingText:String,
  }],
  ShoppingList:[String],
}, )
user_accounts.plugin(findOrCreate);
const Account = model("Account", user_accounts)

app.get('/auth/google/callback', 
  passport.authenticate('google', 
  { successRedirect: "/login/success",
    failureRedirect:"/login/failed" }),
  );

app.get("/login/failed", (req,res)=>{
  res.status(401).json({
    success:false,
    message:"Failure"
  })
})
app.get("/login/success", (req,res)=>{

  res.redirect(`${process.env.CALLBACKURL}`)
  Account.findOne({ Email: req.user.Email }).exec()
        .then((account) => {
          if(!account.first_name){     
            data={
              first_name:ProfileAuth.name.givenName,
              last_name: ProfileAuth.name.familyName,
            }
            Account.findOneAndUpdate({ id: currentAccount.id },data,{new: true} )
        .then(updatedDoc => {
            currentAccount=updatedDoc
            ProfileAuth={}
          })
      }else{
        console.log("ACCOUNT HAS ALREADY THE NAME")
      
      }
          
        })
  // res.status(200).json({
  //   success:true,
  //   message:"Succesful",
  //   // user:req.user,
  // })
})
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

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
  app.post("/recipeFinderByName", function(req,res,next) {
    axios.get(`http://www.themealdb.com/api/json/v1/1/search.php?s=${req.body.search}`)
    .then((response)=>{
      res.json(response.data)
    }
    )
    
  })
  app.post("/RecipefromID", function(req,res,next) {
  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.body.search}`)
  .then((response)=>{
    res.json(response.data)
  }
  )
})
  app.get("/MyrecipefromID",function(req,res,next) {
    let recipes=[]
    const promises=[]
     Account.findOne({id:currentAccount.id}).exec()
     .then((data)=>{
      for (let index = 0; index < data.MyRecipes.length; index++) {
        const promise=axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.MyRecipes[index]}`)
        .then((response)=>{
          let necessarydata={
            id:response.data.meals[0].idMeal,
            mealName:response.data.meals[0].strMeal,
            MealCategory:response.data.meals[0].strCategory,
            Area:response.data.meals[0].strArea,
            Image:response.data.meals[0].strMealThumb,

          }
          
          recipes.push(necessarydata)
          
        })
        promises.push(promise)
      }
      return Promise.all(promises);
     })
     
     .then(() => {
      res.status(200).json(recipes);
    })
    .catch((error) => {
      // Handle any errors
      next(error);
    });
    
    
    
  })
  app.get("/latestAddedRecipe", function (req,res,next) {
    const recipes=[]
    const promises=[]
    Account.findOne({id:currentAccount.id}).exec()
    .then((data)=>{
      let latestNumRecipe
      if(data.MyRecipes.length<=3)
      latestNumRecipe=data.MyRecipes.length
      else if(data.MyRecipes.length>3)
      latestNumRecipe=3
      for (let index = 1; index <= latestNumRecipe ; index++) {
        const promise=axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.MyRecipes[data.MyRecipes.length- index]}`)
        .then((response)=>{
          let necessarydata={
            id:response.data.meals[0].idMeal,
            mealName:response.data.meals[0].strMeal,
            MealCategory:response.data.meals[0].strCategory,
            Area:response.data.meals[0].strArea,
            Image:response.data.meals[0].strMealThumb,

          }
          
          recipes.push(necessarydata)
          
        })
        promises.push(promise)
      }
      return Promise.all(promises);
     })
     
     .then(() => {
      res.status(200).json(recipes);
    })
    .catch((error) => {
      // Handle any errors
      next(error);
    });

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
app.get("/getShoppingList",async (req,res,next)=>{
  try {
    const doc=await Account.findOne({id:currentAccount.id})
    res.status(200).json({msg:"ShoppingList Received",ListofIngredient:doc.ShoppingList})
  } catch (error) {
    res.status(400).json({msg:"Error in Shopping List"})
  }
  
  
})
app.post("/removeFromShoppingList",async (req,res,next)=>{
  const arrayOfIngredient=req.body.data
  console.log(arrayOfIngredient)
  Account.updateOne({id: currentAccount.id},{$pullAll:{ShoppingList:arrayOfIngredient}})
  .then(response=>{
    res.status(200).json({msg:"Ingredient have been deleted"})
  })
  .catch(response=>{
    res.status(400).json({msg:"There is an error somewhere..."})
  })
})
app.post("/deleteRecipe", (req,res,next)=>{
  const mealID=req.body.search
  console.log(mealID)
  Account.updateOne({ id: currentAccount.id },{$pull:{MyRecipes:mealID}})
  .then(data=>{
    console.log(data)
  })
  
    
  
})
app.put("/AddingIngredientsToShoppingList",async(req,res,next)=>{
  // const doc = await Account.findOne({ id: currentAccount.id })
  const IngredientArray=[]
  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.body.RecipeId}`)
  .then(response=>{
    const meal=response.data.meals[0]
    const Number_of_ingredients=20
    for (let index = 1; index < Number_of_ingredients; index++) {
      if(meal[`strIngredient${index}`]!="" )
      if(meal[`strIngredient${index}`])
      {
        console.log(meal[`strIngredient${index}`])
        IngredientArray.push(meal[`strIngredient${index}`])

          // Account.updateOne({id:currentAccount.id},{$addToSet:{ShoppingList:meal[`strIngredient${index}`]}})
          // .then(response=>{
          //   if(index===Number_of_ingredients-1)
          //     {
          //       console.log("Executed")
          //       res.status(200).json({msg:" The ingredients was succesfully Added to the Shopping List"
              
          //     })}
          // })
          // .catch(err=>{
          //   res.status(400).json({msg:err})
          // })
        
      }
      
  }
  Account.updateOne({id:currentAccount.id},{$addToSet:{ShoppingList:{$each:IngredientArray}}})
  .then(response=>{
    res.status(200).json({msg:" The ingredients was succesfully Added to the Shopping List"
  })
})
  .catch(response=>{
    res.status(400).json({msg:response})
  
  })
 
})
})
app.put("/ReviewForRecipe",async(req,res,next)=>{
  console.log(req.body)
  const doc = await Account.findOne({ id: currentAccount.id });
  let exists=false;
  for (let index = 0; index < doc.Reviews.length; index++) {
    if(doc.Reviews[index].RecipeId==req.body.data.RecipeId)
     { exists=true
      doc.Reviews[index]=req.body.data
      await doc.save();
    }
}
if(!exists){
  doc.Reviews.push(req.body.data)
  await doc.save();
  res.status(201).json({msg:"Review Added to your list!"})
 }
 
})
app.put("/updateRecipe", async (req,res,next)=>{
const doc = await Account.findOne({ id: currentAccount.id });
let exists=false;
for (let index = 0; index < doc.MyRecipes.length; index++) {
    if(doc.MyRecipes[index]==req.body.mealID)
      exists=true
}
if(!exists){
 doc.MyRecipes.push(req.body.mealID)
 await doc.save();
 res.status(201).json({msg:"Recipe Added to your list!"})
}
else{
  res.status(400).json({msg:"The Recipe is already in your list"})
}




})
MongooseConnect().then
    (app.listen(PORT, () => {
        console.log(`Working in port ${PORT}`)
    }))