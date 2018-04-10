'use strict';

require('dotenv').config();

const prompt = require('prompt');
const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeManager = require('./services/nodeManager.js');

const express = require('express');
const http = require('http');
let io = require('socket.io');

const app = express();
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.redirect('/main.htm');
});
const server = http.createServer(app).listen(process.env.SERVER_PORT);

io = io.listen(server);
io.on('connection', (client) => {
    console.log('connected to client');
    client.on('node-data', (data) => {
        data = JSON.parse(data.toString('utf8'));
        console.log(data);
        process.env.NODE_PORT = data.port;
        process.env.IS_BACKUP = data.isBackup;
        process.env.BACKUP_1_HOST = '127.0.0.1';
        process.env.BACKUP_1_PORT = data.backup1_port;
        process.env.BACKUP_2_HOST = '127.0.0.1';
        process.env.BACKUP_2_PORT = data.backup2_port;

        configure();
    });
});

// For localhost testing purposes
// prompt.get(['port', 'is_backup'], (err, result) => {
//     if (err) {
//         return onErr(err);
//     }
//     process.env.NODE_PORT = result.port;
//     process.env.IS_BACKUP = result.is_backup;

//     promptLocations();
// });


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

    console.log('Validator active on 127.0.0.1:%s', process.env.NODE_PORT);
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
