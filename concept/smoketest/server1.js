var smoke = require('smokesignal')

'use strict';

var node = smoke.createNode({
    port: 8496,
    address: smoke.localIp("127.0.0.1") // Tell it your subnet and it'll figure out the right IP for you
})

// listen on network events...

node.on('connect', function() {
    // Hey, now we have at least one peer!
    var newpeer = node.peers.list[node.peers.list.length - 1];
    node.broadcast.write("new validator connected with ip " + newpeer.socket.host + " and port " + newpeer.socket.port)
})

node.on('disconnect', function() {
    // Bah, all peers gone.
})

// Broadcast is a stream
process.stdin.pipe(node.broadcast).on('data', function(chunk) {
    console.log("A peer told you: " + chunk);
    var peers = node.peers.list;
    var ips = "";
    for (peer in peers) {
        ips += peer.socket;
    }
    console.log("Current ip's are: " + peers[0].socket.host + ", port: " +
        peers[0].socket.port);

});
//Start the darn thing
node.start()

// mah, i'd rather stop it
//node.stop()