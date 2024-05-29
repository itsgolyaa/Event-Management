const express = require('express');
const mongoose = require('mongoose');
const bcrypt  = require('bcrypt');
const User = require('./models/user');
const app = express();
const request = require('request');
const axios = require('axios');
//const rootCA = require('ssl-root-cas').create();
const https = require('https');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AddEvent = require('./models/event');
const LoginUser = require('./models/loggedInUsers');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

try {
mongoose.connect("mongodb://localhost:27017/event_management");
}
catch(err){
    console.log("Not able to connect to db");
}

app.post('/bookMyEvent/register',(req,res) => {
    let user = new User ({
        fullName : req.body.fullName,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password,8),
        role : req.body.role
    });
    user.save().then(data => {
        return res.status(200).json({message : "User Created !!!"});
    }).catch(err => {
        return res.status(500).json({error : err});
    });
});

app.post('/bookMyEvent/login', (req,res) =>{
    let emailinp = req.body.email;
    User.findOne ({
        email : emailinp
    }).then((user) =>{
        if(!user){
            return
        }
        let isPasswordValid   = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordValid){
            res.status(401).json({message : "OOPS wrong password"});
        }else{
            var token = jwt.sign({
            },process.env.MYSECRET,
                {expiresIn : 86400});
            const loginUser = new LoginUser({
                email : emailinp,
                Token : token
            });
            loginUser.save().then(data => {
                return res.status(200).json({message : "User token added !!!"});
            }).catch(err => {
                return res.status(500).json({error : "err adding token : "+err});
            });
           return res.status(200).send({
                user:{id: user.id},
                message:"You're In bro!!!",
                yourToken : token
           }); 
        }
    }).catch()
});

app.post('/bookMyEvent/event', (req,res) => {
    let jwtInp = req.body.jwt;
    let eventDate = req.body.eventDate;
    let eventName = req.body.eventName;
    LoginUser.findOne ({
        jwt : jwtInp
    }).then((user) => {
       const evnt = new AddEvent({
            UserToken : jwtInp,
            event : eventName,
            Date : eventDate
       })
       evnt.save().then(data => {
        return res.status(200).json({message : "event added !!!"});
    }).catch(err => {
        return res.status(500).json({error : "err adding event : "+err});
    });
    }).catch((err) => {
        return res.status(500).json({error : "Not able to find user"});
    })

});