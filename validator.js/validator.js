'use strict';

require('dotenv').config();

let smoke = require('smokesignal');

const node = smoke.createNode({
    port: parseInt(process.env.PORT),
    address: smoke.localIp(process.env.HOST),
    seeds: [
        {port: parseInt(process.env.SEED1_PORT), address: process.env.SEED1_HOST},
    ],
});

process.stdin.pipe(node.broadcast).pipe(process.stdout);

node.on('connect', function() {
    // Hey, now we have at least one peer!
    // ...and broadcast stuff -- this is an ordinary duplex stream!
    node.broadcast.write('HEYO! I\'m here');
});

// process.stdin.pipe(node.broadcast).pipe(process.stdout);

node.start();

console.log('Validator active on %s:%s', process.env.HOST, process.env.PORT);
