let sec = require('./security');

/**
 * Default message
 */
var verified = false;
class Transaction {
    /**
     * 
     * @param {*} senderpubkey 
     * @param {*} data 
     */
    constructor(transactionmodel) {
        this._senderpubkey = transactionmodel.senderpubkey;
        this._receiveraddress = transactionmodel.receiver
        this._signature = transactionmodel.signature;
        this._amount = transactionmodel.amount;
        this._timestamp = transactionmodel.timestamp;
    }

    getTimeStamp() {
        return this._timestamp;
    };

    verify() {
        if (!this.verified) {
            if (sec.Verify(this._signature, this._senderpubkey) !== "") {
                console.log("Succesfully verified signature!");
                verified = true;
                return true;
            } else {
                console.log("Signature invalid!");
                return false;
            }
        } else {
            console.log("Transaction already verified")
            return true;
        }
    };
}

module.exports = Transaction;