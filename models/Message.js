const mongoose = require('mongoose');

const msgSchmea = new mongoose.Schema({
    username:{
        type: String,
        required:true,
    },
    room:{
        type:String,
        required:true,
    },
    reverseRoom:{
        type:String,
        required:true,
    },
    msg:{
        type:String,
        required:true
    },
    time :{ 
        type:Date, 
        default:Date.now 
    }
})

const Msg = mongoose.model('message', msgSchmea);

module.exports = Msg;