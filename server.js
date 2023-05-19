require('dotenv').config()

const bodyParser = require("body-parser")
const express = require("express")
const app = express()
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors())
PORT = process.env.PORT || 3000

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

app.get("/", (req, res, next) => {

    res.sendFile(__dirname + "/index.html")
})
app.post("/login", (req, res, next) => {


    Account.findOne({ Email: req.body.email }).exec()
        .then((account) => {
            if (account) {
                bcrypt.compare(req.body.password, account.Password).then(function (result) {
                    if (result) {
                        console.log("Account:", account)
                        res.json(true)
                    }
                    else {
                        console.log("Check  password again",)
                        res.json(false)

                    }
                })
            }
            else {
                console.log("Check your email ",)
                res.json(false)
            }

        });

}

)




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