let readline = require('readline');
let async = require('async');
let security = require('../logic/security');
let fs = require('fs');
let Transaction = require('../modules/transaction');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let privKey1 = '0500000508090900000000000005020304000001000005060000000902060300aeb59688bc8c07eecf840f0da0f7dbe1642367ef27ede71743e6c4f93765fa42';
let pubKey1 = 'aeb59688bc8c07eecf840f0da0f7dbe1642367ef27ede71743e6c4f93765fa42';
let address1 = 'SNOWd72b8b76f866b638d3d93a';

let privKey2 = '0807000000000007090000000000000902070005000001010005000400000300c90ba9d597147a2a865b782f0068c6dfd456e5415b366fea4bc2db3004ef406d';
let pubKey2 = 'c90ba9d597147a2a865b782f0068c6dfd456e5415b366fea4bc2db3004ef406d';
let address2 = 'SNOW188b6121b5ff37ff19efc2';

let json;

async.series([
    (callback) => {

        rl.question('Write to file', function (args) {
            let data = {
                senderpubkey: pubKey1,
                receiveraddress: pubKey2,
                amount: 10,
                timestamp: Date.now(),
            };

            json = JSON.stringify(new Transaction(data));

            //fs.writeFile('transaction.json', json, 'utf8', callback);
        });
    },
    (callback) => {
        rl.question('Write signed to file', function (args) {
            let transactionJson = JSON.parse(json);

            let message = transactionJson.senderpubkey + transactionJson.receiveraddress + transactionJson.amount + transactionJson.timestamp
            let signature = security.signDetached(message, privKey1);

            let data = {
                senderpubkey: transactionJson.senderpubkey,
                receiveraddress: transactionJson.receiveraddress,
                amount: transactionJson.amount,
                timestamp: transactionJson.timestamp,
                signature: signature,
            };
            let jsonSigned = JSON.stringify(new Transaction(data));

            //fs.writeFile('signedTransaction.json', jsonSigned, 'utf8', callback);
        });
    },
], () => {
    rl.close();
});
