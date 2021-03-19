const { removeAllListeners } = require('nodemon');

var io = require('socket.io')(process.env.PORT || 29015);

console.log('Server has started');

var hostsockets = []
io.on('connection',function(socket){

    
    socket.on('hasconnected',function(){
        console.log('Connected!');
        socket.emit('serverconnect');
    });
    //we employ this function when the host starts a room
    socket.on('createroom',function(){
        hostsockets.push(socket);
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
        console.log('Joined room ' + roomCode);
        for(var room in io.sockets.adapter.rooms)
            console.log(room);
        socket.emit('roomcode',roomCode);
    });

    socket.on('disconnect',function(){
        console.log('Disconnected!');
        for(var sock in hostsockets)
            if(socket == sock)
            {
                
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
