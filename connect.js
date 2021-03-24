const connectButton = document.getElementById('connect');

connectButton.addEventListener("click",connectAndPass);

var socket = io("http://localhost:3000");
function connectAndPass()
{
    var user = document.getElementById('nickname').value;
    var room = document.getElementById('room').value;

    socket.emit('websiteconnect', user, room);
}

socket.on('invalidroom', function()
{
    var roomInput = document.getElementById('room');
    roomInput.placeholder="INVALID";
    roomInput.value = "";
})

socket.on('invaliduser', function()
{
    var userInput = document.getElementById('nickname');
    userInput.placeholder = 'INVALID';
    userInput.value = "";
})
socket.on('roomjoin',function()
{
    console.log('joined');
}
)