const Security = require('../logic/security');

/**
 *
 */
class Transaction {
    /**
     *
     * @param {*} data
     */
    constructor(data) {
        this._senderpubkey = data.senderpubkey;
        this._receiveraddress = data.receiveraddress;
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
        return Security.verifyDetached(this._data, this._signature, this._senderpubkey);
    }
}

module.exports = Transaction;
