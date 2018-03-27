'use strict';
require('dotenv').config();

const smoke = require('smokesignal');

const node = smoke.createNode({
    port: parseInt(process.env.PORT),
    address: smoke.localIp(process.env.HOST),
});

process.stdin.pipe(node.broadcast).pipe(process.stdout);

node.on('connect', function() {
    // Hey, now we have at least one peer!
    // ...and broadcast stuff -- this is an ordinary duplex stream!
    console.log('Test');
});

node.on('disconnect', function() {
  console.log('Disconnected. Sorry.');
});

node.on('error', function(e) {
    throw e;
});

node.start();

console.log('Backup Validator active on %s:%s', process.env.HOST, process.env.PORT);
