'use strict';
require('dotenv').config();

const smoke = require('smokesignal');

const node = smoke.createNode({
    port: process.env.PORT,
    address: smoke.localIp(process.env.HOST),
    seeds: [{port: process.env.SEED1_PORT, address: process.env.SEED1_HOST}],
});

node.on('connect', function() {
    // Hey, now we have at least one peer!
    // ...and broadcast stuff -- this is an ordinary duplex stream!
    node.broadcast.write('HEYO! I\'m here');
});

console.log('Port', node.options.port);
console.log('IP', node.options.address);
console.log('ID', node.id);

process.stdin.pipe(node.broadcast).pipe(process.stdout);
node.broadcast.write('i am here brotha\'s');

node.start();
