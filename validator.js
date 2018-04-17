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

let PORT = 9177;

// Initialize app with Express
const app = express();
app.use(express.static(__dirname + '/public'));

// Redirect default '/' call to main.htm page
app.get('/', (req, res) => {
    res.redirect('/main.html');
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

    socket.on('node-data', (data) => {
        setEnvironmentVariables(JSON.parse(data.toString('utf8')));
        initNode();
        socket.emit('node-initialized', JSON.stringify({
            id: node.id,
            host: process.env.NODE_HOST,
            port: PORT,
            isBackup: process.env.IS_BACKUP,
        }));
    });
    socket.on('broadcast-message', (data) => {
        if (sender) {
            // For testing purposes
            sender.broadcastTransaction(JSON.parse(data.toString('utf8')).message);
        }
    });
});

/**
 *
 * @param {*} data
 */
function setEnvironmentVariables(data) {
    process.env.IS_BACKUP = data.isBackup;
    console.log(data.isBackup);
    if (data.isBackup) {
        process.env.NODE_HOST = data.host;
        process.env.BACKUP_2_HOST = data.other_host;
        PORT = 9178;
        console.log('Is backup: %s : %s', process.env.NODE_HOST, process.env.BACKUP_2_HOST);
    } else {
        process.env.NODE_HOST = '127.0.0.1';
        process.env.BACKUP_1_HOST = data.backup1_host;
        process.env.BACKUP_2_HOST = data.backup2_host;
        PORT = 9177;
        console.log('Is not backup: %s : %s : %s', process.env.NODE_HOST, process.env.BACKUP_1_HOST, process.env.BACKUP_2_HOST);
    }
}

/** */
function initNode() {
    node = new NodeProvider().createNode();

    // Enable sending and receiving messages
    sender = new Sender(node);
    new Receiver(sender, node, messager);

    node.start();

    console.log('Validator listening on port %s', PORT);
}
