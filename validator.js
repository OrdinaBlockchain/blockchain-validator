'use strict';

require('dotenv').config();
const url = require('url');
const path = require('path');
const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const Receiver = require('./services/receiver.js');
const Sender = require('./services/sender');
const NodeManager = require('./services/nodeManager.js');

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
    process.env.PORT = nodedata.port;
    process.env.IS_BACKUP = nodedata.backup === 'on' ? 'true' : 'false';
    process.env.BACKUP_1_HOST = '127.0.0.1';
    process.env.BACKUP_1_PORT = nodedata.backupport1;
    process.env.BACKUP_2_HOST = '127.0.0.1';
    process.env.BACKUP_2_PORT = nodedata.backupport2;

    const nodeManager = new NodeManager();
    const node = nodeManager.createNode();

    // Enable sending and receiving messages
    new Receiver(new Sender(node), node);

    node.start();

    console.log('Validator active on 127.0.0.1:%s', process.env.PORT);
});

// create menu template
const walletMenuTemplate = [{
    label: 'Options',
    submenu: [
        {label: 'Set public key'},
        {
            label: 'Add transaction',
            click() {
                createAddTransactionWindow();
            },
        },
        {label: 'Clear public key'},
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
