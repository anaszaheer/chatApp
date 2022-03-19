const socket = io();
const chatForm = document.querySelector('.chat-form')
const Input = document.querySelector('.chat-input')
const chatMessages = document.querySelector('.chat-window');
const reciever = document.getElementById('chattingwithID');
const chatWindow = document.querySelector('.chat-window');
const clearForm = document.querySelector('.clear-class');
const selectId = document.getElementById('roomhiddenid').value;



if(selectId){
    socket.emit("find", selectId);
}
if(selectId){
    socket.emit('joinRoom', selectId);
}

//event executes on chat-form submit from chat view
chatForm.addEventListener('submit', event => {
    event.preventDefault()
    const msg = event.target.elements.msg.value;
    
    //emitting message from "enter text" text box to server
    socket.emit('chatMessage', msg);
    Input.value = ''
})  

//event executes on clearMessages-form submit from chat view
clearForm.addEventListener('submit', event => {
    event.preventDefault();
    socket.emit('clear');
    location.reload();
})  

//message from server
socket.on('message', message =>{
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//displaying message to dom from database
socket.on('output-chat', message => {
    
    if(message.length){
        message.forEach(message => {
            outputMessage(message);
        });
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//output message to DOM
function outputMessage(message) {
    if(message.msg){
        const div = document.createElement('div')
        div.classList.add('message')
        div.innerHTML = `<p class="meta"> ${message.username} <span>  </span></p>
        <p class="text">
            ${message.msg}
        </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }
    if(!message.msg){
        const div = document.createElement('div')
        console.log(message);
        div.classList.add('message')
        div.innerHTML = `<p class="meta"> <span> </span></p>
        <p class="text">
            ${message}
        </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }
}