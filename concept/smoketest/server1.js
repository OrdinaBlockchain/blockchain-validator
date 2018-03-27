let smoke = require('smokesignal')

'use strict';

let node = smoke.createNode({
    port: 8496,
    address: smoke.localIp("127.0.0.1") // Tell it your subnet and it'll figure out the right IP for you
})

// listen on network events...

node.on('connect', function() {

})

node.on('disconnect', function() {
    // Bah, all peers gone.
})

// Broadcast is a stream
process.stdin.pipe(node.broadcast).on('data', function(chunk) {
    console.log(chunk.toString('utf8'));
    let message = JSON.parse(chunk.toString('utf8'));
    if (message.type === "new") {
        node.broadcast.write("new validator connected with ip " + message.ip + " and port " + message.port);
    }
});
//Start the darn thing
node.start()

// mah, i'd rather stop it
//node.stop()