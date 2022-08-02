const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/to-do-list-DB", {useNewUrlParser: true});

const usersSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = new mongoose.model("User", usersSchema);

const tasksSchema = new mongoose.Schema({
    title: String,
    description: String
});
const Task = new mongoose.model("Task", tasksSchema);

app.get("/home", function(req, res){
    Task.find(function(err, foundTasks){
        res.send(foundTasks);
    });
});

app.post("/register", function(req, res){

    User.findOne({email: req.body.email}, function(err, foundUser){
        if(foundUser){
            res.send("User Already Exists");
        }else{
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                });
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect("/login");
                    }
                });
            });
        }
    });
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email}, function(err, foundUser){
        if(err){
            console.log(err);
        }else if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result===true){
                    User.find(function(err, result){
                        res.redirect("/home");
                    });
                }else{
                    res.send("Wrong password");
                }
            });
        }
    });
});

app.post("/newItem", function(req, res){
    const task = new Task({
        title : req.body.title,
        description : req.body.description
    });
    task.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/home");
        }
    });
});

app.listen(5000, function(){
    console.log("Server started on port 5000.");
});