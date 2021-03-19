const { removeAllListeners } = require('nodemon');

var io = require('socket.io')(process.env.PORT || 29015);

console.log('Server has started');

var hostsockets = [];
var hostRooms = {};
io.on('connection',function(socket){

    
    socket.on('hasconnected',function(){
        console.log('Connected!');
        socket.emit('serverconnect');
    });
    //we employ this function when the host starts a room
    socket.on('createroom',function(){
        console.log('Creating room...');
        var roomCode = "";
        var badCodes = ['SHIT', 'FUCK', 'PISS', 'CUNT', 'TWAT', 'TWIT', 'FAGT', 'NIGR'];
        roomCode = makeRoomCode(4);
        //assign a roomCode at random, and first verify if it's bad
        while(badCodes.includes(roomCode))
        {
            roomCode = makeRoomCode(4);
        }
        //then verify if there's another room of the same name on the server
        var found = true
        while(found)
        {
            found = false;
            for(var room in io.sockets.adapter.rooms)
            if(room == roomCode)
                {
                    roomCode = makeRoomCode(4)
                    found = true;
                }
        }

        socket.join(roomCode);
        hostsockets.push(socket);
        hostRooms[socket] = roomCode;
        console.log('Joined room ' + roomCode);
        for(var room in io.sockets.adapter.rooms)
            console.log("Room: " + room);
        console.log(hostsockets.length);
        socket.emit('roomcode',roomCode);
    });

    socket.on('disconnect',function(){
        console.log('Disconnected!');
        if(hostsockets.indexOf(socket) != -1){
            disconnectAllRoomMembers(hostRooms[socket]);
            removeHost(socket);
        }
    });
});


function makeRoomCode(length)
{
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRTSUVWXYZ';
    var charLength = characters.length;
    for(var i = 0 ; i < length; i++)
        result += characters.charAt(Math.floor(Math.random() * charLength));
    return result;
}

function removeHost(hostSocket)
{
    const index = hostsockets.indexOf(hostSocket);
    if(index > -1)
        hostsockets.splice(hostSocket);
}

function disconnectAllRoomMembers(room)
{
    var members = [];
    for(var member in io.sockets.adapter.rooms[room].sockets)
        members.push(member);
    for(var member in members)
    member.disconnect();
}

