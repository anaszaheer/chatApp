const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const dotenv = require('dotenv');
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
const Msg = require('./models/Message');
const server = http.createServer(app);
const io = socketio(server);
const cookie = require('cookie');
const jwebt = require('jsonwebtoken');


app.use(express.urlencoded({ extended: false }));

require('./db/conn'); //database connection

dotenv.config();  //runs env

//setting static folder
app.use(express.static(path.join(__dirname, '/')));

//importing routes
const authRoute = require('./routes/auth.js');

//Middleware
app.use(express.json());

//Routes Middleware
app.use('/api/', authRoute);



io.use(async (socket, next) => {
    const token = cookie.parse(socket.handshake.headers.cookie);
    const payload = await jwebt.verify(token.jwt, process.env.TOKEN_SECRET);
    socket.userName = payload.username;
    next();
});

io.on('connection', socket => {

    console.log('Client started socket.io server: '+ socket.userName);

    socket.on('joinRoom', (userRoom)=>{

        //room
        const room = (userRoom + socket.userName);
        const reverseRoom = (socket.userName + userRoom);

        socket.choosenRoom = room;
        socket.reverseChoosenRoom = reverseRoom;

        socket.join(socket.choosenRoom);
        
        //welcomes current user
        socket.emit('message', 'Welcome to my ChatApp!');

        //broadcast when user connects
        [room, reverseRoom].forEach(function(rooms){
            socket.broadcast.to(rooms).emit('message', `${socket.userName} has joined the chat`);
        });
    });

    //database data
    socket.on('find', (data) => {
        roomName = (data + socket.userName );
        reverseRoomName = (socket.userName + data);

        Msg.find({$or:[{room: roomName}, {room: reverseRoomName}]}).exec().then(result => {
            socket.emit('output-chat', result)
        });
    });

    //clear all messages
    socket.on('clear', () => {
        Msg.deleteMany({$or:[{room: roomName}, {room: reverseRoomName}]}).then(result => {
            if(result){
                console.log("Records deleted.");
            }
            else{
                console.log("Records not deleted.");
            }
        });
    });

    //listen for chatMessage from client side
    socket.on('chatMessage', msg=>{
        const username = socket.userName;
        const room = socket.choosenRoom;
        const reverseRoom = socket.reverseChoosenRoom;

        const msgFind = new Msg({ username:username, room:room , reverseRoom:reverseRoom , msg: msg })

        msgFind.save().then(() => {
            io.to(socket.choosenRoom).emit('message', {username,room:room, msg:msg});
            io.to(socket.reverseChoosenRoom).emit('message', {username,room:room, msg:msg});
        });
    });

    //sends when disconnects
    socket.on('disconnect', () => {
        [socket.choosenRoom, socket.reverseChoosenRoom].forEach(function(rooms){
        io.to(rooms).emit('message', `${socket.userName} has left the chat`);
        });
    });
});

const PORT = 3000 || process.env.PORT;


server.listen(PORT, () => console.log(`Server running on ${PORT}`));