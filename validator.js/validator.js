'use strict';

require('dotenv').config();

let smoke = require('smokesignal');

const node = smoke.createNode({
    port: parseInt(process.env.PORT),
    address: smoke.localIp(process.env.HOST),
    seeds: [
        {port: parseInt(process.env.SEED1_PORT), address: process.env.SEED1_HOST},
    ],
    minPeerNo: 1,
    maxPeerNo: 4,
});

process.stdin.pipe(node.broadcast).pipe(process.stdout);

node.on('connect', () => {
    console.log('Welcome %s to the frozen network! :)', node.id);
    console.log('You just made your first connection');
});

node.on('disconnect', () => {
    console.log('Disconnected');
  });

node.start();

console.log('Validator active on %s:%s', process.env.HOST, process.env.PORT);
