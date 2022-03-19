const mongoose = require('mongoose');

//creating new schema
const employeeSchema = new mongoose.Schema({
    username: {
        type: "string",
        required:true,
        min:3,
        max:255
    },
    password: {
        type: "string",
        required:true,
        min:4,
        max:1024 //because this gets hashed and the hashed number is very long so max number is high
    },
    date: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        default: null,
        max:255
    }
})

//creating collection
const User = new mongoose.model('Login', employeeSchema);

module.exports= User;