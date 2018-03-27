'use strict';
require('dotenv').config();

const smoke = require('smokesignal');

const node = smoke.createNode({
    port: process.env.PORT,
    address: smoke.localIp(process.env.HOST),
});

node.on('connect', function() {
    // Hey, now we have at least one peer!
    // ...and broadcast stuff -- this is an ordinary duplex stream!
    node.broadcast.write('HEYO! I\'m here');
    console.log('Port', node.options.port);
});

console.log('Port', node.options.port);
console.log('IP', node.options.address);
console.log('ID', node.id);

console.log('Connecting...');

node.on('connect', function() {
  console.log('Connected. Happy chatting!\n');
});

node.on('disconnect', function() {
  console.log('Disconnected. Sorry.');
});

// Send message
process.stdin.pipe(node.broadcast).pipe(process.stdout);

node.on('error', function(e) {
throw e;
});
node.start();
