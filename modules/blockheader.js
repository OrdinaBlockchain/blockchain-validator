const Security = require('../logic/security');

/**
 * Block header is a value object containing the basic information of a block
 */
class BlockHeader {
    /**
     * @param {*} data
     */
    constructor(data) {
        if (data.constructorVersion === 1) {
            this.coinbase = data.header.coinbase;
            this.parentHash = data.header.parentHash;
            this.version = data.header.version;
            this.timestamp = Date.now();
            this.blockHash = null;
        } else {
            this.coinbase = data.header.coinbase;
            this.parentHash = data.header.parentHash;
            this.version = data.header.version;
            this.timestamp = data.header.timestamp;
            this.blockHash = data.header.blockHash;
        }
    }

    /**
     * Calculates the blockHash of the block this header belongs to with the provided blockData
     * @param {Transaction[]} blockData
     * @return {string} hash
     */
    calculateBlockHash(blockData) {
        let hash = '0';
        if (this.isValidHeaderData(blockData)) {
            hash = Security.hash(this.coinbase + this.parentHash + this.version + this.timestamp + blockData);
        }

        return hash;
    }

    /**
     * Checks if the property data + provided blockData is valid to calculate the blockHash
     * @param {Transaction[]} blockData
     * @return {boolean}
     */
    isValidHeaderData(blockData) {
        return this.coinbase != null && this.parentHash != null && this.version != null && this.timestamp <= Date.now();
    }
}

module.exports = BlockHeader;
