var smoke = require('smokesignal')
'use strict';

var ip = "127.0.0.1";
var initialport = 8495;
var connected = false;
var node;
while (!connected) {
    try {
        node = smoke.createNode({
            port: 8495,
            address: smoke.localIp(ip) // Tell it your subnet and it'll figure out the right IP for you
                ,
            seeds: [{ port: initialport, address: ip }] // the address of a seed (a known node)
        })
        if (node) { connected = true; }
    } catch (ex) {
        initialport++;
    }
}

// listen on network events...

node.on('connect', function() {
    // Hey, now we have at least one peer!

    // ...and broadcast stuff -- this is an ordinary duplex stream!
    node.broadcast.write("i am here brotha's")
})

node.on('disconnect', function() {
    // Bah, all peers gone.
})

// Broadcast is a stream
process.stdin.pipe(node.broadcast).pipe(process.stdout)

//Start the darn thing
node.start()
node.broadcast.write("i am here brotha's")
    // mah, i'd rather stop it
    //node.stop()