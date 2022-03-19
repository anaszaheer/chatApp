const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('Database connected');
}).catch((err)=>{
    console.log('Connection not successful ' + err)
});
