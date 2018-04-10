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
    constructor(senderpubkey, data) {
        this._senderpubkey = senderpubkey;
        this._data = data;
        this._receiveraddress = data.receiver
        this._signature = data.signature;
        this._amount = data.amount;
        this._timestamp = data.timestamp;
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