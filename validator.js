'use strict';

require('dotenv').config();

const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeProvider = require('./services/nodeProvider.js');
const express = require('express');
const http = require('http');
let io = require('socket.io');

// Initialize app with Express
const app = express();
app.use(express.static(__dirname + '/public'));

// Redirect default '/' call to main.htm page
app.get('/', (req, res) => {
    res.redirect('/main.htm');
});

// Start listening with HTTP (picks random available port)
const server = http.createServer(app).listen();
console.log(server.address().port);

// Start listening with WebSockets
io = io.listen(server);

io.on('connection', (socket) => {
    socket.on('node-data', (data) => {
        setEnvironmentVariables(JSON.parse(data.toString('utf8')));
        initNode();
    });
});

/**
 *
 * @param {*} data
 */
function setEnvironmentVariables(data) {
    process.env.NODE_PORT = data.port;
    process.env.IS_BACKUP = data.isBackup;

    // Default is localhost for testing purposes
    process.env.BACKUP_1_HOST = '127.0.0.1';
    process.env.BACKUP_1_PORT = data.backup1_port;

    // Default is localhost for testing purposes
    process.env.BACKUP_2_HOST = '127.0.0.1';
    process.env.BACKUP_2_PORT = data.backup2_port;
}

/** */
function initNode() {
    const node = new NodeProvider().createNode();

    // Enable sending and receiving messages
    new Receiver(new Sender(node), node);

    node.start();
}
