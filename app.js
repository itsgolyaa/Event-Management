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
const Seqval = require('./models/sequenceLogic');
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

app.post('/bookMyEvent/events', async (req, res) => {
    let jwtInp = req.body.jwt;
    let eventDate = req.body.eventDate;
    let eventName = req.body.eventName;
    
    try {
        const user = await LoginUser.findOne({ Token: jwtInp });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let NextVal = await Seqval.findOneAndUpdate(
            { idVal: "AutoVal" },
            { "$inc": { "seqVal": 1 } },
            { new: true }
        );
        if (!NextVal) {
            const AddVal = new Seqval({
                idVal: "AutoVal",
                seqVal: 1
            });
            await AddVal.save();
        }
        const evnt = new AddEvent({
            UserToken: jwtInp,
            event: eventName,
            Date: eventDate,
            eventId : NextVal.seqVal
        });

        await evnt.save();
        return res.status(200).json({ message: "Event added!!!" });

    } catch (err) {
        return res.status(500).json({ error: "Error processing request: " + err.message });
    }
});


app.get('/bookMyEvent/events/getEvent', async (req,res)=> {
    let eId = req.query.eventId;
    AddEvent.findOne({
        eventId : eId
    }).then((eventData)=>{
        if(!eventData){
            return res.status(404).json({message:"There is no such event"});
        }
        return res.status(200).json({
            eventName : eventData.event,
            eventDate: eventData.Date,
            participants: eventData.Participants
        })
    }).catch((err)=>{
        return res.status(404).json({message:"There is no such event for this id :"+err});
    })
   
});

app.post('/bookMyEvent/events/AddUsersToEvents', async (req,res)=>{
    const Names = {
        "Name" : req.body.pName,
        "FeesPaid?" : req.body.pRegDoneBool
    }
    const participants = {
        $set : {'Participants':Names}
    }
    AddEvent.findOneAndUpdate({ eventId: req.body.id }, participants, {new: true})
    .then((data)=>{
        return res.status(200).json({"participant is added: " :data})
    }).catch((err)=>{
        return res.status(404).json({message: "We dont have this event"+err});
    })
});

app.put('/bookMyEvent/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { eventName, eventDate, jwt } = req.body;

    try {
        const user = await LoginUser.findOne({ Token: jwt });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedEvent = await AddEvent.findOneAndUpdate(
            { eventId },
            { event: eventName, Date: eventDate },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        return res.status(200).json({ message: "Event updated!!!", updatedEvent });

    } catch (err) {
        return res.status(500).json({ error: "Error updating event: " + err.message });
    }
});

app.patch('/bookMyEvent/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { eventName, eventDate, jwt } = req.body;

    try {
        const user = await LoginUser.findOne({ Token: jwt });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedEvent = await AddEvent.findOneAndUpdate(
            { eventId },
            { $set: { event: eventName, Date: eventDate } },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        return res.status(200).json({ message: "Event partially updated!!!", updatedEvent });

    } catch (err) {
        return res.status(500).json({ error: "Error updating event: " + err.message });
    }
});

app.delete('/bookMyEvent/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { jwt } = req.body;

    try {
        const user = await LoginUser.findOne({ Token: jwt });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const deletedEvent = await AddEvent.findOneAndDelete({ eventId });

        if (!deletedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        return res.status(200).json({ message: "Event deleted!!!", deletedEvent });

    } catch (err) {
        return res.status(500).json({ error: "Error deleting event: " + err.message });
    }
});