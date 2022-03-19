const jwt = require('jsonwebtoken');
const User = require('../models/User');


const reqAuthentication = (req,res,next)=>{
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedUser)=>{
        if (err) {
            res.redirect('/api/');
        }
        else{
            next();
        }
    }); 
}
const reqNotAuthentication = (req,res,next)=>{
    const token = req.cookies.jwt;
    
    if(token){
        res.redirect('/api/index');
    }
    if(!token){
        next();
    } 
}

module.exports = {reqAuthentication, reqNotAuthentication};

