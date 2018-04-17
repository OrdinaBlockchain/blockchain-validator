'use strict';

require('dotenv').config();

const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeProvider = require('./services/nodeProvider.js');
const Messager = require('./util/messager');
const opn = require('opn');
const express = require('express');
const http = require('http');
let io = require('socket.io');

let sender;
let node;
let messager;

const PORT = 9177;

// Initialize app with Express
const app = express();
app.use(express.static(__dirname + '/public'));

// Redirect default '/' call to main.htm page
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Start listening with HTTP (picks random available port)
const server = http.createServer(app).listen();

// Open default browser after server creation
opn('http://localhost:' + server.address().port, (err) => {
    console.log(err);
});

// Start listening with WebSockets
io = io.listen(server);

io.on('connection', (socket) => {
    // Initialize logger for real-time webpage logging
    messager = new Messager(socket);
    setEnvironmentVariables(JSON.parse(JSON.stringify({
        isBackup: false,
        host: '10.0.0.4',
        backup1_host: '10.0.0.2',
        backup2_host: null,
        other_host: null,
    })));
    initNode();
    socket.emit('node-initialized', JSON.stringify({
        id: node.id,
        port: PORT,
        isBackup: process.env.IS_BACKUP,
    }));
    socket.on('node-data', (data) => {
        return null;
    });

    socket.on('broadcast-message', (data) => {
        if (sender) {
            // For testing purposes
            sender.broadcastTransaction(JSON.parse(data.toString('utf8')).message);
        }
    });

    socket.on('generate-keypair', (data) => {
        socket.emit('keypair', JSON.stringify({
            pubkey: node.id,
            privkey: process.env.NODE_PORT,
        }));
    });

    socket.on('set-pubkey', (data) => {
        socket.emit('pubkey-set', JSON.stringify({
            test: 'test',
        }));
    });

    socket.on('generate-transaction-data', (data) => {
        socket.emit('transaction-generated', JSON.stringify({
            transaction: 'transaction',
        }));
    });

    socket.on('publish-transaction', (data) => {
        socket.emit('transaction-published', JSON.stringify({
            transaction: 'transaction',
        }));
    });
});

/**
 *
 * @param {*} data
 */
function setEnvironmentVariables(data) {
    process.env.IS_BACKUP = data.isBackup;
    if (data.isBackup) {
        process.env.NODE_HOST = data.host;
        process.env.BACKUP_2_HOST = data.other_host;
    } else {
        process.env.NODE_HOST = '10.0.0.4';
        process.env.BACKUP_1_HOST = data.backup1_host;
        process.env.BACKUP_2_HOST = data.backup2_host;
    }
}

/** */
function initNode() {
    node = new NodeProvider().createNode();

    // Enable sending and receiving messages
    sender = new Sender(node);
    new Receiver(sender, node, messager);

    node.start();

    console.log('Validator listening on port %s', process.env.NODE_PORT);
}