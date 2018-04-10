let smoke = require('smokesignal')
'use strict';

var ip = "127.0.0.1";
var port = 8495;
var connected = false;
let node;

function createNode(port) {
    node = smoke.createNode({
        port: port,
        address: smoke.localIp(ip),
        seeds: [{ port: 8495, address: ip }]
    })
    if (node) { connected = true; }
}

function setNodeBehaviour() {
    node.on('connect', function() {
        let message = { type: "new", "ip": ip, "port": port };
        node.broadcast.write(JSON.stringify(message));
    })
    node.on('disconnect', function() {
        console.log('FACK NO NODES');
    })

    process.stdin.pipe(node.broadcast).on('data', function(chunk) {
        console.log(chunk.toString('utf8'));
        node.peers.list.forEach(element => {
            console.log(element.id);
        });

    });
}

function startNode(curport) {
    port = curport;
    createNode(curport);
    setNodeBehaviour();
    node.on("error", function() {
        startNode(curport + 1);
    });
    node.start();
}

startNode(port);
// mah, i'd rather stop it
//node.stop()