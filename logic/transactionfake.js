let readline = require('readline');
let async = require('async');
let security = require('../logic/security');
let fs = require('fs');
let transaction = require('../modules/transaction');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var privKey1 = '0500000508090900000000000005020304000001000005060000000902060300aeb59688bc8c07eecf840f0da0f7dbe1642367ef27ede71743e6c4f93765fa42';
var pubKey1 = 'aeb59688bc8c07eecf840f0da0f7dbe1642367ef27ede71743e6c4f93765fa42';
var address1 = 'SNOWd72b8b76f866b638d3d93a';

let privKey2 = '0807000000000007090000000000000902070005000001010005000400000300c90ba9d597147a2a865b782f0068c6dfd456e5415b366fea4bc2db3004ef406d';
var pubKey2 = 'c90ba9d597147a2a865b782f0068c6dfd456e5415b366fea4bc2db3004ef406d';
var address2 = 'SNOW188b6121b5ff37ff19efc2';

var json;

async.series([
    (callback) => {
        rl.question('Write to file', function (args) {
            var data = {
                senderpubkey: pubKey1,
                receiveraddress: pubKey2,
                amount: 10,
                timestamp: Date.now()
            }

            json = JSON.stringify(new transaction(data));

            fs.writeFile('transaction.json', json, 'utf8', callback);
        });
    },
    (callback) => {
        rl.question('Write signed to file', function (args) {
            var transactionJson = JSON.parse(json);

            var message = transactionJson._senderpubkey + transactionJson._receiveraddress + transactionJson._amount + transactionJson._timestamp
            var signature = security.signDetached(message, privKey1);

            var data = {
                senderpubkey: transactionJson._senderpubkey,
                receiveraddress: transactionJson._receiveraddress,
                amount: transactionJson._amount,
                timestamp: transactionJson._timestamp,
                signature: signature
            }
            let jsonSigned = JSON.stringify(new transaction(data));

            fs.writeFile('signedTransaction.json', jsonSigned, 'utf8', callback);
        });
    }
], () => {
    rl.close();
});
