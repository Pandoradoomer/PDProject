const { removeAllListeners } = require('nodemon');



const io = require('socket.io')(process.env.PORT||3000, {transports: ['websocket', 'polling']});

console.log('Server has started');

var hostsockets = [];
var hostRooms = {};

io.on('connection',function(socket){
    socket.on("connect_error", (err) =>
    {
        console.log('connect_error due to ${err.message}');
    })
    socket.on('websiteconnect',(user, room) =>
    {
        console.log("Username:" + user + " room: " + room);
        var found = false;
        for(var key in hostRooms){
            if(hostRooms.hasOwnProperty(key))
            {
                console.log(hostRooms[key]);
                if(hostRooms[key] == room)
                    found = true;
            }
        }
        if(found == false)
        {
                console.log("Invalid room!");
                socket.emit("invalidroom");
        }
        else
        {
            if(socketInRoom(user,room))
                {
                    socket.emit('invaliduser');
                    return;
                }
            socket.nickname = user;
            console.log('Successfully joined!');
            socket.join(room);
            io.in(room).emit('roomjoin', socket.nickname);
        }
    });
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
        socket.nickname = "host_" + roomCode;
        hostsockets.push(socket);
        hostRooms[socket] = roomCode;
        console.log('Joined room ' + roomCode);
        for(var room in io.sockets.adapter.rooms)
            console.log("Room: " + room);
        console.log(hostsockets.length);
        socket.emit('roomcode',roomCode);
    });

    socket.on('disconnect',function(){
        console.log('Disconnected! - socket: ' + socket.id);
        socket.broadcast.emit('roomleave', socket.nickname);
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
    
    var socketRoom = io.sockets.adapter.rooms[room];
    if(socketRoom == null)
        {
            console.log("host only room");
            return;
        }
    else
        console.log(socketRoom.length);
    var members = socketRoom.sockets;
    for(var member in members)
        io.sockets.sockets[member].leave(room);
    console.log(io.sockets.adapter.rooms[room]);
}

function socketInRoom(socket, room)
{
    console.log("Socket nickname: " + socket);
    var ioRoom = io.sockets.adapter.rooms[room];
    if(ioRoom == null)
    {
        console.log("Invalid room!");
        return false;
    }
    for(var member in ioRoom.sockets)
    {
        var socketMember = io.sockets.sockets[member];
         console.log(socketMember.nickname);
             if(socketMember.nickname == socket)
                 return true;
            
    }
    return false;
}

