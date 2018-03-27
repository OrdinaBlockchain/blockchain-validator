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
});

node.start();
