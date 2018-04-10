var transaction = Transaction.prototype;
var bip39 = require('bip39');
var nacl_factory = require('js-nacl');

var mnemonic = bip39.generateMnemonic();
var signed = false;
var signSK;
var signPK
var signature;
var nacl;
var seed;

function Transaction(senderpubkey, data) {
    seed1 = bip39.mnemonicToEntropy(mnemonic)
    this.seed = seed1;
    this._senderpubkey = senderpubkey;
    this._receiveraddress = data.receiver
    this._data = data;
    this._amount = data.amount;
    this._timestamp = data.timestamp;
    nacl_factory.instantiate(function(nacle) {
        const { signSk, signPk } = nacle.crypto_sign_seed_keypair(seed1);
        this.signPk = signPk;
        this.signSk = signSk;
        this.nacl = nacle;
    })
}

transaction.getTimeStamp = function() {
    return this._timestamp;
};

transaction.sign = function() {
    if (!signed) {
        var dataBytes = Buffer.from(this._data, 'utf8');
        nacl_factory.instantiate(function() {
            this._signature = this.nacl.crypto_sign_detached(dataBytes, signSk);
        })
        signed = true;
        console.log("transaction succesfully signed!")
    } else { console.log("transaction already signed!") }
};

transaction.verify = function() {
    if (signed) {
        var dataBytes = Buffer.from(this._data, 'utf8');
        var verified = this.nacl.crypto_verify_detached(this._signature, dataBytes, signPk);
        if (verified) { console.log("Succesfully verified signature!"); } else { console.log("Signature invalid!"); }
    } else { console.log("An unsigned transaction can not be verified!") }
};

transaction.getTimeStamp = function() {
    return this._timestamp;
};

module.exports = Transaction;