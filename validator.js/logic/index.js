const readline = require('readline');
const async = require('async');
const Security = require('./security');
const fs = require('fs');

const security = new Security();

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let mnemonic;
let keypair; // eslint-disable-line no-unused-vars
let message;
let signature;
let succes;
let address;

// rl.question('What do you think of Node.js? ', (answer) => {
//     // TODO: Log the answer in a database
//     console.log(`Thank you for your valuable feedback: ${answer}`);

//     rl.close();
//   });

async.series([
    (callback) => {
        rl.question('Step 1: Generate Mnemonic', function(args) {
            mnemonic = security.generateMnemonic();
            callback();
        });
    },
    (callback) => {
        rl.question('Step 2: Generate Keypair with Mnemonic', function(args) {
            keypair = {public: public, private: private} = security.generateKeyPair(mnemonic); // eslint-disable-line no-undef
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
            signature = security.sign(message, private); // eslint-disable-line no-undef
            callback();
        });
    },

    (callback) => {
        rl.question('Step 5: Verify signature', function(args) {
            succes = security.verify(signature, public); // eslint-disable-line no-undef
            console.log('Message from signature: ' + succes);
            callback();
        });
    },
    (callback) => {
        rl.question('Generate Wallet Address', function(args) {
            address = security.generateAddress(public); // eslint-disable-line no-undef
            callback();
        });
    },
    (callback) =>{
        rl.question('Write to file', function(args) {
            let data = {
                version: '1.0',
                mnemonic: mnemonic,
                privateKey: private, // eslint-disable-line no-undef
                publicKey: public, // eslint-disable-line no-undef
                address: address,
              };
            let json = JSON.stringify(data);

            fs.writeFile('igloo.json', json, 'utf8', callback);
        });
    },
], () => {
    rl.close();
});
