const nacl_factory = require('js-nacl');
const bip39

/**
 * Default message
 */
var signed = false;
var signSK;
var signPK
var signature;
var nacl;
var seed;

class Transaction {
    /**
     * 
     * @param {*} senderpubkey 
     * @param {*} data 
     */
    constructor(senderpubkey, data) {
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

    getTimeStamp() {
        return this._timestamp;
    };

    sign() {
        if (!this.signed) {
            var dataBytes = Buffer.from(this._data, 'utf8');
            nacl_factory.instantiate(function() {
                this._signature = this.nacl.crypto_sign_detached(dataBytes, signSk);
            })
            signed = true;
            console.log("transaction succesfully signed!")
        } else { console.log("transaction already signed!") }
    };

    verify() {
        if (this.signed) {
            var dataBytes = Buffer.from(this._data, 'utf8');
            var verified = this.nacl.crypto_verify_detached(this._signature, dataBytes, signPk);
            if (verified) {
                console.log("Succesfully verified signature!");
                return true;
            } else {
                console.log("Signature invalid!");
                return false;
            }
        } else {
            console.log("An unsigned transaction can not be verified!")
            return false;
        }
    };

    getTimeStamp() {
        return this._timestamp;
    };
}

module.exports = Transaction;