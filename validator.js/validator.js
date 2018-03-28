'use strict';

require('dotenv').config();

const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeManager = require('./services/nodeManager.js');
const prompt = require('prompt');

prompt.start();

// For localhost testing purposes
prompt.get(['port', 'is_backup'], (err, result) => {
    if (err) {
        return onErr(err);
    }
    process.env.PORT = result.port;
    process.env.IS_BACKUP = result.is_backup;

    configure();
});

/** */
function configure() {
    const nodeManager = new NodeManager();
    const node = nodeManager.createNode();

    // Enable message tranferring
    process.stdin.pipe(node.broadcast).pipe(process.stdout);

    // Enable sending and receiving messages
    new Receiver(new Sender(), node);

    node.start();

    console.log('Validator active on %s:%s', process.env.HOST, process.env.PORT);
}

/**
 *
 * @param {*} err
 * @return {*}
 */
function onErr(err) {
    console.log(err);
    return 1;
  }
