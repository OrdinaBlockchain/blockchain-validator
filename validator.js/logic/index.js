let readline = require('readline');
let async = require('async');
let sec = require('./security');
let fs = require('fs');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var mnemonic;
var keypair;
var message;
var signature;
var succes;
var address;

// rl.question('What do you think of Node.js? ', (answer) => {
//     // TODO: Log the answer in a database
//     console.log(`Thank you for your valuable feedback: ${answer}`);
  
//     rl.close();
//   });

async.series([
    (callback) => {
        rl.question('Step 1: Generate Mnemonic', function(args) {
            mnemonic = sec.GenerateMnemonic();
            callback();
        });
    },
    (callback) => {
        rl.question('Step 2: Generate Keypair with Mnemonic', function(args) {
            keypair = {public: public, private: private} = sec.GenerateKeyPair(mnemonic);
            callback();
        });
    },
    (callback) => {
        rl.question('Step 3: Input a message: ', function(args) {
            message = args;
            callback();
        });
    },
    
    (callback) => {
        rl.question('Step 4: Sign message', function(args) {
            signature = sec.Sign(message, private);
            callback();
        });
    },

    (callback) => {
        rl.question('Step 5: Verify signature', function(args) {
            succes = sec.Verify(signature, public);
            console.log("Message from signature: " + succes);
            callback();
        });
    },
    (callback) => {
        rl.question('Generate Wallet Address', function(args) {
            address = sec.GenerateAddress(public);
            callback();
        });
    },
    (callback) =>{
        rl.question('Write to file', function(args) {
            var data = {
                version: "1.0",
                mnemonic: mnemonic,
                privateKey: private,
                publicKey: public,
                address: address
              }
            var json = JSON.stringify(data);
    
            fs.writeFile('igloo.json', json, 'utf8', callback);
        });
    }
], () => {
    rl.close();
});