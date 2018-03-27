var smoke = require('smokesignal')
'use strict';

var ip = "127.0.0.1";
var port = 8495;
var connected = false;
var node;

function createNode(port) {
    node = smoke.createNode({
        port: port,
        address: smoke.localIp(ip) // Tell it your subnet and it'll figure out the right IP for you
            ,
        seeds: [{ port: 8496, address: ip }] // the address of a seed (a known node)
    })
    if (node) { connected = true; }
}

function setNodeBehaviour() {
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
}

function startNode(curport) {
    try {
        createNode(curport);
        setNodeBehaviour()
        node.start()
    } catch (err) {
        startNode(curport + 1);
    }
}

//Start the darn thing
startNode(port);

node.broadcast.write("i am here brotha's")
    // mah, i'd rather stop it
    //node.stop()