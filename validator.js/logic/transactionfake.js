let readline = require('readline');
let async = require('async');
let sec = require('./security');
let fs = require('fs');
let transaction = require('../modules/transaction');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var publik;
var address;

async.series([
    (callback) => {
        rl.question('Write to file', function (args) {
            var data = {
                senderpubkey: 'b578940e7aed91a46f96075e3d81189aaf3c89b853ac1e2c5186339d5d0f4078',
                receiveraddress: 'SNOW2aa1a46016937694ba932a',
                amount: 10,
                timestamp: Date.now()
            }

            var json = JSON.stringify(new transaction(data));

            fs.writeFile('transaction' + data.timestamp + '.json', json, 'utf8', callback);
        });
    }
], () => {
    rl.close();
});