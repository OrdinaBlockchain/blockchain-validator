'use strict';

require('dotenv').config();
const url = require('url');
const path = require('path');
const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeManager = require('./services/nodeManager.js');
const prompt = require('prompt');

let mainWindow;
let addTransactionWindow;
// listen for app to be ready
app.on('ready', function() {
    // new window
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));
    // Quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    });
    // Build menu from template
    const walletMenu = Menu.buildFromTemplate(walletMenuTemplate);
    Menu.setApplicationMenu(walletMenu);
});

/**
 * create add transaction window
 */
function createAddTransactionWindow() {
    addTransactionWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add transaction',
    });
    addTransactionWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addTransactionWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));
    // handle garbage collection
    addTransactionWindow.on('closed', function() {
        addTransactionWindow = null;
    });
}

// catch transaction:add
ipcMain.on('transaction:add', function(e, transaction) {
    mainWindow.webContents.send('transaction:add', transaction);
    addTransactionWindow.close();
});

ipcMain.on('nodedata:set', function(e, nodedata) {
    console.log(nodedata);
});

// create menu template
const walletMenuTemplate = [{
    label: 'Options',
    submenu: [
        { label: 'Set public key' },
        {
            label: 'Add transaction',
            click() {
                createAddTransactionWindow();
            },
        },
        { label: 'Clear public key' },
        {
            label: 'Quit',
            click() {
                app.quit();
            },
        },
    ],
}];
// if mac, add empty object to menu
if (process.platform == 'darwin') {
    walletMenuTemplate.unshift({});
}

// add developer tools itme if not in prod
if (process.env.NODE_ENV !== 'production') {
    walletMenuTemplate.push({
        label: 'Developer tools',
        submenu: [{
                label: 'Toggle Devtools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.webContents.openDevTools();
                },
            },
            {
                role: 'reload',
            },
        ],
    });
}

prompt.start();

// For localhost testing purposes
prompt.get(['port', 'is_backup'], (err, result) => {
    if (err) {
        return onErr(err);
    }
    process.env.PORT = result.port;
    process.env.IS_BACKUP = result.is_backup;

    promptLocations(result.is_backup);
});

/**
 *
 * @param {string} isBackup
 */
function promptLocations(isBackup) {
    if (isBackup === 'true') {
        if (process.env.TEST === 'true') {
            process.env.BACKUP_2_HOST = '127.0.0.1';
            process.env.BACKUP_2_PORT = 9001;
            configure();
        } else {
            prompt.get(['other_backup_host', 'other_backup_port'], (err, result) => {
                if (err) {
                    return onErr(err);
                }
                process.env.BACKUP_2_HOST = result.other_backup_host;
                process.env.BACKUP_2_PORT = result.other_backup_port;
                configure();
            });
        }
    } else {
        if (process.env.TEST === 'true') {
            process.env.BACKUP_1_HOST = '127.0.0.1';
            process.env.BACKUP_1_PORT = 9000;
            process.env.BACKUP_2_HOST = '127.0.0.1';
            process.env.BACKUP_2_PORT = 9001;
            configure();
        } else {
            prompt.get(['first_backup_host', 'first_backup_port',
                'second_backup_host', 'second_backup_port',
            ], (err, result) => {
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
}

/** */
function configure() {
    const nodeManager = new NodeManager();
    const node = nodeManager.createNode();

    // Enable incoming messages to log into terminal
    // process.stdin.pipe(node.broadcast).pipe(process.stdout);

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