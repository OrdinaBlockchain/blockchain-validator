let sec = require('./security');

/**
 * Default message
 */
let verified = false;

const security = new Security();

/**
 *
 */
class Transaction {
    /**
     *
     * @param {*} data
     */
    constructor(senderpubkey, data) {
        this._senderpubkey = senderpubkey;
        this._data = data;
        this._receiveraddress = data.receiver;
        this._signature = data.signature;
        this._amount = data.amount;
        this._timestamp = data.timestamp;
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
    verifySignature() {
        return security.verifyDetached(this._data, this._signature, this._senderpubkey);
    }
}

module.exports = Transaction;
