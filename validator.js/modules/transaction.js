let sec = require('../logic/security');
/**
 * Default message
 */
let verified = false;

/**
 *
 */
class Transaction {
    /**
     * 
     * @param {*} data 
     */
    constructor(data) {
        this._data = data;

        this._senderpubkey = data.senderpubkey;
        this._receiveraddress = data.receiveraddress
        this._amount = data.amount;
        this._timestamp = data.timestamp;

        this._signature = data.signature;
    }

    /**
     * @return {*}
     */
    getTimeStamp() {
        return this._timestamp;
    }

    /**
     * @return {*}
     */
    verify() {
        if (!this.verified) {

            if (sec.VerifyDetached(data, this._signature, this._senderpubkey)) {
                console.log("Succesfully verified signature!");
                verified = true;
                return true;
            } else {
                console.log('Signature invalid!');
                return false;
            }
        } else {
            console.log('Transaction already verified');
            return true;
        }
    }
}

module.exports = Transaction;
