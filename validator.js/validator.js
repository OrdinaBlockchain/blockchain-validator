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

    // promptOtherData(result.is_backup);
    setPresetData(result.is_backup);
});

/**
 *
 * @param {string} isBackup
 */
function promptOtherData(isBackup) {
    if (isBackup === 'true') {
        prompt.get(['other_backup_host', 'other_backup_port'], (err, result) => {
            if (err) {
                return onErr(err);
            }
            process.env.BACKUP_2_HOST = result.other_backup_host;
            process.env.BACKUP_2_PORT = result.other_backup_port;
            configure();
        });
    } else {
        prompt.get(['first_backup_host', 'first_backup_port',
        'second_backup_host', 'second_backup_port'], (err, result) => {
            if (err) {
                return onErr(err);
            }
            process.env.BACKUP_1_HOST = result.first_backup_host;
            process.env.BACKUP_1_PORT = result.first_backup_port;
            process.env.BACKUP_2_HOST = result.second_backup_host;
            process.env.BACKUP_2_PORT = result.second_backup_port;
            configure();
        });
    }
}

/**
 *
 * @param {string} isBackup
 */
function setPresetData(isBackup) {
    if (isBackup === 'true') {
        process.env.BACKUP_2_HOST = '127.0.0.1';
        process.env.BACKUP_2_PORT = 9001;
        configure();
    } else {
        process.env.BACKUP_1_HOST = '127.0.0.1';
        process.env.BACKUP_1_PORT = 9000;
        process.env.BACKUP_2_HOST = '127.0.0.1';
        process.env.BACKUP_2_PORT = 9001;
        configure();
    }
}

/** */
function configure() {
    const nodeManager = new NodeManager();
    const node = nodeManager.createNode();

    // Enable incoming messages to log into terminal
    process.stdin.pipe(node.broadcast).pipe(process.stdout);

    // Enable sending and receiving messages
    new Receiver(new Sender(node), node);

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
