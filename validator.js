'use strict';

require('dotenv').config();

const prompt = require('prompt');
const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeManager = require('./services/nodeManager.js');

prompt.start();

// For localhost testing purposes
prompt.get(['port', 'is_backup'], (err, result) => {
    if (err) {
        return onErr(err);
    }
    process.env.PORT = result.port;
    process.env.IS_BACKUP = result.is_backup;

    promptLocations();
});

/**
 *
 * @param {string} isBackup
 */
function promptLocations() {
    prompt.get(['backupport1', 'backupport2'], (err, result) => {
        if (err) {
            return onErr(err);
        }
        process.env.BACKUP_1_HOST = '127.0.0.1';
        process.env.BACKUP_1_PORT = result.backupport1;
        process.env.BACKUP_2_HOST = '127.0.0.1';
        process.env.BACKUP_2_PORT = result.backupport2;
        configure();
    });
}

/** */
function configure() {
    const nodeManager = new NodeManager();
    const node = nodeManager.createNode();

    // Enable sending and receiving messages
    new Receiver(new Sender(node), node);

    node.start();

    console.log('Validator active on 127.0.0.1:%s', process.env.PORT);
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
