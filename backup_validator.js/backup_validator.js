'use strict';
require('dotenv').config();

const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const smoke = require('smokesignal');

const node = smoke.createNode({
    port: parseInt(process.env.PORT),
    address: smoke.localIp(process.env.HOST),
    minPeerNo: 0,
});
node.id = 'Ares';

process.stdin.pipe(node.broadcast).pipe(process.stdout);

// Setup receiver and sender
new Receiver(new Sender(node), node);

node.start();

console.log('Backup Validator active on %s:%s', process.env.HOST, process.env.PORT);
