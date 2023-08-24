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
const axios = require("axios")
var CronJob = require('cron').CronJob;
const { ObjectId } = require("bson");
const fs = require('fs');
const saltRounds = 10;
let currentAccount = {}

var noDietRestrictionUpdate = new CronJob(
  '20 33 8 * * *',
  async function () {
    const SuggestionRecipeNumber = 3
    const promises = []
    const NoRestrictionDiet = []
    
    console.log("IM INSIDE THE CRON JOB FUNCTION")
    for (let index = 0; index < SuggestionRecipeNumber; index++) {
      ``
      promises[index] = axios.get("https://www.themealdb.com/api/json/v1/1/random.php")
        .then((response) => {
          NoRestrictionDiet.push(response.data.meals[0].idMeal)

          // const TodaySuggestion=new RECIPE ({
          //   noDietRestriction:response.data.meals[0].idMeal
          // })
          // TodaySuggestion.save()

        })
    }
    
    Promise.all(promises).then((values) => {
      console.log("IM BEING REGISTERED INSIDE PROMISE", NoRestrictionDiet)

      RECIPE.updateOne({ _id: new ObjectId(process.env.RECIPE_COLLECTION_ID) }, { $set: { noDietRestriction: NoRestrictionDiet } }, { upsert: true })
        .then(response => {

        }

        )
    }
    )

    console.log("IM BEING REGISTERED", NoRestrictionDiet)



  },
  null,
  true,
  'America/Toronto'
);
function RecipeGenerator() {
  Account.find({id:currentAccount.id})
  .then(accounts=>{


    const RestrictedDiet=[]
    if(accounts[0].Diet.ArrayofDietRestriction!=0 && accounts[0].Diet.TypeOfdiet==="Diet restriction"){
      RECIPE.find({_id: new ObjectId(process.env.RECIPE_COLLECTION_ID)})
      .then(recipes=>{
        while (RestrictedDiet.length<3) {
          let chosenRecipe=recipes[0].DietWithHealthLabels[Math.floor(Math.random() * recipes[0].DietWithHealthLabels.length)]
        let chosenRecipeHealthLabel=chosenRecipe.mealHealthLabels
        let CheckDiet=accounts[0].Diet.ArrayofDietRestriction.every(DietRestriction=>{
          let CapitalizedDietRestriction=DietRestriction.toUpperCase()
          CapitalizedDietRestriction=CapitalizedDietRestriction.replace(/_/g, '-');
          return chosenRecipeHealthLabel.includes(DietRestriction)|| chosenRecipeHealthLabel.includes(CapitalizedDietRestriction) 
          
        })
        
        console.log("DietChecking",CheckDiet)
        if (CheckDiet) {
          RestrictedDiet.push(chosenRecipe.mealID)
          console.log(chosenRecipe)
        }
        }
        Account.updateOne({id:accounts[0].id}, { $set: { RestrictedDietSuggestions: RestrictedDiet } })
        .then(response=>{
            console.log(response)
        })
        
        // console.log("CHOSEN RECIPE",chosenRecipe)
        // for (let indexhealthLabel = 0; indexhealthLabel < chosenRecipe.mealHealthLabels.length; indexhealthLabel++) {
          
          
        // }
      })
        
    }
  

  })
  
}
var RestrictedDietForAllUsers = new CronJob(
  '08 46 17 * * *',
  async function() {
    
    Account.find()
    .then(accounts=>{
  
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
    const RestrictedDiet=[]
    if(accounts[accountIndex].Diet.ArrayofDietRestriction!=0 && accounts[accountIndex].Diet.TypeOfdiet==="Diet restriction"){
      RECIPE.find({_id: new ObjectId(process.env.RECIPE_COLLECTION_ID)})
      .then(recipes=>{
        while (RestrictedDiet.length<3) {
          let chosenRecipe=recipes[0].DietWithHealthLabels[Math.floor(Math.random() * recipes[0].DietWithHealthLabels.length)]
        let chosenRecipeHealthLabel=chosenRecipe.mealHealthLabels
        let CheckDiet=accounts[accountIndex].Diet.ArrayofDietRestriction.every(DietRestriction=>{
          let CapitalizedDietRestriction=DietRestriction.toUpperCase()
          CapitalizedDietRestriction=CapitalizedDietRestriction.replace(/_/g, '-');
          return chosenRecipeHealthLabel.includes(DietRestriction)|| chosenRecipeHealthLabel.includes(CapitalizedDietRestriction) 
          
        })
        
        console.log("DietChecking",CheckDiet)
        if (CheckDiet) {
          RestrictedDiet.push(chosenRecipe.mealID)
          console.log(chosenRecipe)
        }
        }
        Account.updateOne({id:accounts[accountIndex].id}, { $set: { RestrictedDietSuggestions: RestrictedDiet } })
        .then(response=>{
            console.log(response)
        })
        
        // console.log("CHOSEN RECIPE",chosenRecipe)
        // for (let indexhealthLabel = 0; indexhealthLabel < chosenRecipe.mealHealthLabels.length; indexhealthLabel++) {
          
          
        // }
      })
        
    }
    
  }
    })
    // while (VegetarianDiet.length<3) {
    //   RECIPE.find({_id: new ObjectId(process.env.RECIPE_COLLECTION_ID)})
    //   .then(doc=>{
    //     console.log(doc)
    //   })
    // }
  },
  null,
  true,
  'America/Toronto'
);



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,

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
}, authUser))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
},
  function (accessToken, refreshToken, profile, cb) {
    Account.findOrCreate({ id: `G-${profile.id}`, Email: profile.emails[0].value },
      function (err, user) {
        ProfileAuth = profile
        currentAccount = user
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
passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
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
// SuggestionRecipe:[String],
const user_accounts = new Schema({
  id: String,
  first_name: String,
  last_name: String,
  date_of_birth: String,
  gender: String,
  country: String,
  Email: String,
  Password: String,
  MyRecipes: [String],
  Diet: {
    TypeOfdiet: String,
    glutenFree: Boolean,
    dairyFree: Boolean,
    Vegetarian: Boolean,
    Vegan: Boolean,
    ArrayofDietRestriction:[String],
  },
  Reviews: [{
    RecipeId: String,
    ratingStar: Number,
    ratingText: String,
  }],
  ShoppingList: [String],
  RestrictedDietSuggestions:[String],

},)
user_accounts.plugin(findOrCreate);
const Account = model("Account", user_accounts)

const SuggestionRecipe = new Schema({
  noDietRestriction: [String],
  DietWithHealthLabels: [{
    _id: false,
    "mealName": String,
    "mealID": String,
    "mealHealthLabels": [String],

  }]

},)

const RECIPE = model("RECIPE", SuggestionRecipe)
app.get('/auth/google/callback',
  passport.authenticate('google',
    {
      successRedirect: "/login/success",
      failureRedirect: "/login/failed"
    }),
);

app.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Failure"
  })
})
app.get("/login/success", (req, res) => {

  res.redirect(`${process.env.CALLBACKURL}`)
  Account.findOne({ Email: req.user.Email }).exec()
    .then((account) => {
      if (!account.first_name) {
        data = {
          first_name: ProfileAuth.name.givenName,
          last_name: ProfileAuth.name.familyName,
        }
        Account.findOneAndUpdate({ id: currentAccount.id }, data, { new: true })
          .then(updatedDoc => {
            currentAccount = updatedDoc
            ProfileAuth = {}
          })
      } else {
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
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (user) {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        console.log(user, info);
        console.log(req.isAuthenticated());
        currentAccount = user.account
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

app.get("/authenticationCheck", (req, res, next) => {
  console.log("IN authentication check")
  res.json(req.isAuthenticated())

})
app.post("/recipeFinderByName", function (req, res, next) {
  axios.get(`http://www.themealdb.com/api/json/v1/1/search.php?s=${req.body.search}`)
    .then((response) => {
      res.json(response.data)
    }
    )

})
app.post("/RecipefromID", function (req, res, next) {
  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.body.search}`)
    .then((response) => {
      res.json(response.data)
    }
    )
})
app.post("/getOneRecipeFromID", function (req, res, next) {
  console.log("SENTDATA", req.body)
  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.body.search}`)
    .then(response => {
      const meal = response.data.meals[0]
                console.log(meal)
                let ingredients = []
                const Number_of_ingredients = 20
                for (let index = 1; index < Number_of_ingredients; index++) {
                    if (meal[`strIngredient${index}`] != "")
                        if (meal[`strIngredient${index}`]) {
                            let Ingredient = meal[`strMeasure${index}`] + " " + meal[`strIngredient${index}`]
                            ingredients.push(Ingredient)
                        }

                }
      let necessarydata = {
        mealName: meal.strMeal,
                    mealCategory: meal.strCategory,
                    mealImg: meal.strMealThumb,
                    mealtag: meal.strTags,
                    mealInstruction: meal.strInstructions,
                    mealLink: meal.strYoutube,
                    mealIngredients: ingredients,
                    mealID: meal.idMeal,
                    mealArea:meal.strArea,

      }
      res.status(200).json(necessarydata);
    })
    .catch(err => {
      console.log("ERR", err)
    })

})

app.get("/MyrecipefromID", function (req, res, next) {
  let recipes = []
  const promises = []
  Account.findOne({ id: currentAccount.id }).exec()
    .then((data) => {
      for (let index = 0; index < data.MyRecipes.length; index++) {
        const promise = axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.MyRecipes[index]}`)
          .then((response) => {
            let necessarydata = {
              id: response.data.meals[0].idMeal,
              mealName: response.data.meals[0].strMeal,
              MealCategory: response.data.meals[0].strCategory,
              Area: response.data.meals[0].strArea,
              Image: response.data.meals[0].strMealThumb,

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
app.get("/latestAddedRecipe", function (req, res, next) {
  const recipes = []
  const promises = []
  Account.findOne({ id: currentAccount.id }).exec()
    .then((data) => {
      let latestNumRecipe
      if (data.MyRecipes.length <= 3)
        latestNumRecipe = data.MyRecipes.length
      else if (data.MyRecipes.length > 3)
        latestNumRecipe = 3
      for (let index = 1; index <= latestNumRecipe; index++) {
        const promise = axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.MyRecipes[data.MyRecipes.length - index]}`)
          .then((response) => {
            let necessarydata = {
              id: response.data.meals[0].idMeal,
              mealName: response.data.meals[0].strMeal,
              MealCategory: response.data.meals[0].strCategory,
              Area: response.data.meals[0].strArea,
              Image: response.data.meals[0].strMealThumb,

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


app.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    console.log(req.isAuthenticated())
    currentAccount = {}
    res.json(req.isAuthenticated())
  });
});

app.get("/dashboard", (req, res, next) => {
  console.log(currentAccount)
  res.json(currentAccount)
})


app.get("/SuggestionRecipe", async (req, res, next) => {
  const promises = []
  const SuggestionRecipeNumber = 3
  const SuggestionRecipe = []
  const user_doc = await Account.findOne({ id: currentAccount.id }).exec()
  const doc = await RECIPE.findOne({ _id: new ObjectId(process.env.RECIPE_COLLECTION_ID) }).exec()
  if (user_doc.Diet.TypeOfdiet === "No Diet restriction") {
    res.json({ mealID: doc.noDietRestriction })
  }
  else if (user_doc.Diet.TypeOfdiet === "Diet restriction")
  {
    
    res.json({ mealID: user_doc.RestrictedDietSuggestions })
  }
  else if (!user_doc.Diet.TypeOfdiet) {
    res.json({ mealID: doc.noDietRestriction, msg: "Your Account Has not been updated, Go to Profile to set up diet" })
  }
  else {
    // if(user_doc.Diet.)





  }
  // doc.noDietRestriction.forEach(element => {
  // let promise=  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${element}`)
  // .then((response)=>{
  //   let necessarydata = {
  //     id: response.data.meals[0].idMeal,
  //     mealName: response.data.meals[0].strMeal,
  //     MealCategory: response.data.meals[0].strCategory,
  //     Area: response.data.meals[0].strArea,
  //     Image: response.data.meals[0].strMealThumb,

  //   }
  //   SuggestionRecipe.push(necessarydata)
  //   console.log(necessarydata)

  // })
  // promises.push(promise)
  // Promise.all(promises).then(response=>{
  //   console.log("AMSWER",SuggestionRecipe)
  // })

  // });




  // .then((doc)=>{
  //   console.log(doc)
  //   if (doc.Diet.TypeOfdiet === "No Diet restriction") {
  //     for (let index = 0; index < SuggestionRecipeNumber; index++) {``
  //       promises[index] = axios.get("https://www.themealdb.com/api/json/v1/1/random.php")
  //         .then((response) => {
  //           doc.SuggestionRecipe.push(response.data.meals[0].idMeal)
  //         })

  //     }

  //   }
  //   else {
  //     console.log("With RESTRICTION")
  //   }
  // })

  // Promise.all(promises).then(() => {
  //   console.log("RECIPE",SuggestionRecipe)
  //   res.status(200).json({ mealID: SuggestionRecipe })
  // })





})

app.post("/signup", async (req, res, next) => {
  Account.findOne({ Email: req.body.Email }).exec()
    .then((account) => {
      if (!account) {
        bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
          const user = Account({
            id: uuidv4(),
            first_name: req.body.first_name,
            last_name: req.body.lastname,
            Email: req.body.Email,
            Password: hash,
            Diet: {
              TypeOfdiet: 'No Diet restriction',
              glutenFree: false,
              dairyFree: false,
              Vegetarian: false,
              Vegan: false,
              ArrayofDietRestriction: [],
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
app.put("/update", (req, res, next) => {
  console.log("REQ",req.body)
  Account.findOneAndUpdate({ id: currentAccount.id }, req.body, { new: true })
    .then(updatedDoc => {
      console.log("CurrentAccount",currentAccount)
        if(currentAccount.Diet.ArrayofDietRestriction!=req.body.Diet.ArrayofDietRestriction){
          RecipeGenerator()
        }
      currentAccount = updatedDoc
      res.json(updatedDoc)
      console.log('Updated document:', updatedDoc);
    })
    .catch(error => {
      console.error('Error updating document:', error);
    });

})
app.get("/getShoppingList", async (req, res, next) => {
  try {
    const doc = await Account.findOne({ id: currentAccount.id })
    res.status(200).json({ msg: "ShoppingList Received", ListofIngredient: doc.ShoppingList })
  } catch (error) {
    res.status(400).json({ msg: "Error in Shopping List" })
  }


})
app.post("/removeFromShoppingList", async (req, res, next) => {
  const arrayOfIngredient = req.body.data
  console.log(arrayOfIngredient)
  Account.updateOne({ id: currentAccount.id }, { $pullAll: { ShoppingList: arrayOfIngredient } })
    .then(response => {
      res.status(200).json({ msg: "Ingredient have been deleted" })
    })
    .catch(response => {
      res.status(400).json({ msg: "There is an error somewhere..." })
    })
})
app.post("/deleteRecipe", (req, res, next) => {
  const mealID = req.body.search
  console.log(mealID)
  Account.updateOne({ id: currentAccount.id }, { $pull: { MyRecipes: mealID } })
    .then(data => {
      console.log(data)
    })



})
app.put("/AddingIngredientsToShoppingList", async (req, res, next) => {
  // const doc = await Account.findOne({ id: currentAccount.id })
  const IngredientArray = []
  axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.body.RecipeId}`)
    .then(response => {
      const meal = response.data.meals[0]
      const Number_of_ingredients = 20
      for (let index = 1; index < Number_of_ingredients; index++) {
        if (meal[`strIngredient${index}`] != "")
          if (meal[`strIngredient${index}`]) {
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
      Account.updateOne({ id: currentAccount.id }, { $addToSet: { ShoppingList: { $each: IngredientArray } } })
        .then(response => {
          res.status(200).json({
            msg: " The ingredients was succesfully Added to the Shopping List"
          })
        })
        .catch(response => {
          res.status(400).json({ msg: response })

        })

    })
})
app.post("/ReviewForRecipe", async (req, res, next) => {
  console.log(req.body)
  const doc = await Account.findOne({ id: currentAccount.id });
  let exists = false;
  for (let index = 0; index < doc.Reviews.length; index++) {
    if (doc.Reviews[index].RecipeId == req.body.data.RecipeId) {
      exists = true
      doc.Reviews[index] = req.body.data
      await doc.save();
    }
  }
  if (!exists) {
    doc.Reviews.push(req.body.data)
    await doc.save();
    res.status(201).json({ msg: "Review Added to your list!" })
  }

})
app.put("/updateRecipe", async (req, res, next) => {
  const doc = await Account.findOne({ id: currentAccount.id });
  let exists = false;
  for (let index = 0; index < doc.MyRecipes.length; index++) {
    if (doc.MyRecipes[index] == req.body.mealID)
      exists = true
  }
  if (!exists) {
    doc.MyRecipes.push(req.body.mealID)
    await doc.save();
    res.status(201).json({ msg: "Recipe Added to your list!" })
  }
  else {
    res.status(400).json({ msg: "The Recipe is already in your list" })
  }




})
MongooseConnect().then
  (app.listen(PORT, () => {
    console.log(`Working in port ${PORT}`)
  //   RECIPE.find()
  //   .then(doc=>{
  //     console.log(doc)
    
  //   const content= JSON.stringify(doc[0].DietWithHealthLabels)
    
  //   fs.writeFile('./RecipeHealth.txt', content, err => {
  // if (err) {
  //   console.error(err);
  // }

// })
// })
  }))
// var job = new CronJob(
//   '59 39 11 * * *',
//   async function() {
    
//    const  doc=await axios.get(`http://www.themealdb.com/api/json/v1/1/search.php?f=${"t"}`)
//       RECIPE.find()
//       .then(recipeCount => {
        
//         for (let index = 0; index < doc.data.meals.length; index++) {
//           let recipeFound = false
//           for (let CurrentRecipeDoc = 0; CurrentRecipeDoc < recipeCount[0].DietWithHealthLabels.length; CurrentRecipeDoc++) {
          
//             if (recipeCount[0].DietWithHealthLabels[CurrentRecipeDoc].mealID === doc.data.meals[index].idMeal)
//                 recipeFound=true
//           }
//           if(!recipeFound)
//           console.log(doc.data.meals[index].strMeal)
//           }
//         }
//       )
//   },
//   null,
//   true,
//   'America/Toronto'
// );




// var job_two = new CronJob(
//   '25 39 11 * * *',
//   async function () {
//     const promises = []
//     // axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=Eggplant Adobo`)
//     axios.get(`http://www.themealdb.com/api/json/v1/1/search.php?f=${"t"}`)

//       .then((response) => {
//         let NumOfMeal = response.data.meals.length
//         let MealArray = response.data.meals
//         // console.log("The Array of Meal for the letter A",MealArray)
//         console.log("LEngth of array", NumOfMeal)

//         for (let currentMeal = 0; currentMeal < NumOfMeal; currentMeal++) {
//           console.log("Name of Meal", MealArray[currentMeal].strMeal)
//           axios.get(`https://api.edamam.com/api/recipes/v2?app_key=${process.env.EDAMAM_API_KEY}&app_id=${process.env.EDAMAM_APP_ID}&q=${MealArray[currentMeal].strMeal}&type=public`)
//             .then(result => {
//               for (let index = 0; index < 5; index++) {
//                 // console.log("data itself",result.data)
//                 // console.log("If data exists",result.data.hits[index].recipe.label.toLowerCase())

//                 if (result.data.hits[index]) {
//                   if (result.data.hits[index].recipe.label.toLowerCase() === MealArray[currentMeal].strMeal.toLowerCase()) {
//                     let healthLabel = result.data.hits[index].recipe.healthLabels
//                     let RecipeObject = {
//                       "mealName": MealArray[currentMeal].strMeal,
//                       "mealID": MealArray[currentMeal].idMeal,
//                       "mealHealthLabels": healthLabel,
//                     }
//                     // console.log("RecipeObject", RecipeObject)
//                     // DietWithHealthLabels: {
//                     //   "mealName": String,
//                     //   "mealID": String,
//                     //   "mealHealthLabels": [String],

//                     // }
//                     RECIPE.updateOne({ _id: new ObjectId(process.env.RECIPE_COLLECTION_ID) }, { $addToSet: { DietWithHealthLabels: RecipeObject } }, { upsert: true })
//                       .then((response) => {
//                         // console.log(response)
//                       })
//                     break;
//                   }
//                   else if (index === 4) {
//                     console.log("THE MEAL Cannot be found within the 3 first results", MealArray[currentMeal].strMeal)
//                     let IngredientArray = []
//                   const Number_of_ingredients = 20
//                   const meal = MealArray[currentMeal]
//                   for (let CurrentIngredient = 1; CurrentIngredient < Number_of_ingredients; CurrentIngredient++) {
//                     if (meal[`strIngredient${CurrentIngredient}`] != "")
//                       if (meal[`strIngredient${CurrentIngredient}`]) {
//                         IngredientArray.push(meal[`strMeasure${CurrentIngredient}`] + " " + meal[`strIngredient${CurrentIngredient}`])
//                       }
//                   }
//                   console.log("THE MEAL DOES NOT EXIST", MealArray[currentMeal].strMeal)
//                   let data = {
//                     "title": MealArray[currentMeal].strMeal,
//                     "ingr": IngredientArray
//                   }
//                   RECIPE.find()
//                     .then(recipeCount => {

//                       let recipeFound = false
//                       for (let CurrentRecipeDoc = 0; CurrentRecipeDoc < recipeCount[0].DietWithHealthLabels.length; CurrentRecipeDoc++) {
//                         if (recipeCount[0].DietWithHealthLabels[CurrentRecipeDoc].mealID === MealArray[currentMeal].idMeal)
//                           recipeFound = true;
//                       }
//                       if (recipeFound)
//                         console.log("RECIPE Exist")
//                       else if (!recipeFound) {
//                         console.log("CREATING and Storing RECIPE...")
//                         axios.post(`https://api.edamam.com/api/nutrition-details?app_key=${process.env.EDAMAM_NUTRITIONAL_ANALYSIS_API_KEY}&app_id=${process.env.EDAMAM_NUTRITIONAL_ANALYSIS_APP_ID}`, data)
//                           .then(result => {

                            
//                             let RecipeObject = {
//                               "mealName": MealArray[currentMeal].strMeal,
//                               "mealID": MealArray[currentMeal].idMeal,
//                               "mealHealthLabels": result.data.healthLabels,
//                             }
//                             RECIPE.updateOne({ _id: new ObjectId(process.env.RECIPE_COLLECTION_ID) }, { $addToSet: { DietWithHealthLabels: RecipeObject } }, { upsert: true })
//                               .then((response) => {
//                                 // console.log(response)
//                               })
//                           }).catch(err=>{
//                             console.log("ERROR",err.config.data)
//                           })
//                       }
                      
//                     })
//                   }
//                 }
//                 else if (!result.data.hits[index]) {
//                   let IngredientArray = []
//                   const Number_of_ingredients = 20
//                   const meal = MealArray[currentMeal]
//                   for (let CurrentIngredient = 1; CurrentIngredient < Number_of_ingredients; CurrentIngredient++) {
//                     if (meal[`strIngredient${CurrentIngredient}`] != "")
//                       if (meal[`strIngredient${CurrentIngredient}`]) {
//                         // console.log(meal[`strIngredient${CurrentIngredient}`])
//                         IngredientArray.push(meal[`strMeasure${CurrentIngredient}`] + " " + meal[`strIngredient${CurrentIngredient}`])
//                       }
//                   }
//                   // console.log("THE MEAL DOES NOT EXIST", MealArray[currentMeal].strMeal)
//                   let data = {
//                     "title": MealArray[currentMeal].strMeal,
//                     "ingr": IngredientArray
//                   }
//                   RECIPE.find()
//                     .then(recipeCount => {

//                       let recipeFound = false
//                       for (let CurrentRecipeDoc = 0; CurrentRecipeDoc < recipeCount[0].DietWithHealthLabels.length; CurrentRecipeDoc++) {
//                         if (recipeCount[0].DietWithHealthLabels[CurrentRecipeDoc].mealID === MealArray[currentMeal].idMeal)
//                           recipeFound = true;
//                       }
//                       if (recipeFound)
//                         console.log("RECIPE Exist")
//                       else if (!recipeFound) {
//                         console.log("CREATING and Storing RECIPE...")
//                         axios.post(`https://api.edamam.com/api/nutrition-details?app_key=${process.env.EDAMAM_NUTRITIONAL_ANALYSIS_API_KEY}&app_id=${process.env.EDAMAM_NUTRITIONAL_ANALYSIS_APP_ID}`, data)
//                           .then(result => {

                            
//                             let RecipeObject = {
//                               "mealName": MealArray[currentMeal].strMeal,
//                               "mealID": MealArray[currentMeal].idMeal,
//                               "mealHealthLabels": result.data.healthLabels,
//                             }
//                             RECIPE.updateOne({ _id: new ObjectId(process.env.RECIPE_COLLECTION_ID) }, { $addToSet: { DietWithHealthLabels: RecipeObject } }, { upsert: true })
//                               .then((response) => {
//                                 // console.log(response)
//                               })
//                           })
//                           .catch(err=>{
//                             console.log("ERROR",err.config.data)
//                           })
//                       }
                      
//                     })


//                   // console.log(data)
//                 }
//               }
//             })





//         }
//       }
//       )

//     // axios.get(`http://www.themealdb.com/api/json/v1/1/random.php`)
//     //   .then((response) => {
//     //     const mealName = response.data.meals[0].strMeal
//     //     const mealId = response.data.meals[0].idMeal
//     //     console.log("MealName",mealName.toLowerCase())
//     //     axios.get(`https://api.edamam.com/api/recipes/v2?app_key=${process.env.EDAMAM_API_KEY}&app_id=${process.env.EDAMAM_APP_ID}&q=${mealName}&type=public`)
//     //       .then(result => {
//     //         for (let index = 0; index < 3; index++) {
//     //            if (result.data.hits[index].recipe.label.toLowerCase()===mealName.toLowerCase()){
//     //             let healthLabel=result.data.hits[index].recipe.healthLabels
//     //             let RecipeObject={
//     //               "mealName":mealName,
//     //               "mealID":mealId,
//     //               "mealHealthLabels":healthLabel,
//     //             }
//     //             // STOREOBJECT IN RECIPE

//     //               break;
//     //            }

//     //         }
//     //         // console.log(result.data.hits[0].recipe.label, result.data.hits[0].recipe.healthLabels)
//     //         // console.log(result.data.hits[1].recipe.label, result.data.hits[1].recipe.healthLabels)
//     //         // console.log(result.data.hits[2].recipe.label, result.data.hits[2].recipe.healthLabels)

//     //       })
//     //       .catch(err => {
//     //         console.log(err)
//     //       })
//     //   }
//     //   )
//     // // const Diet=[]
//     // // Account.find().exec()
//     // // .then(doc=>{

//     // //   for (let index = 0; index < doc.length; index++) {
//     // //     if(doc[index].Diet.TypeOfdiet)
//     // //     {Diet.push(
//     // //       {id:doc[index].id,
//     // //       Diet: doc[index].Diet})}
//     // //   }
//     // //   console.log("MY FAMI",Diet)
//     // // })


//   },
//   null,
//   true,
//   'America/Toronto'
// );

