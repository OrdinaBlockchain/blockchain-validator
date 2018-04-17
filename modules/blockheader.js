const Security = require('../logic/security');

/**
 * Block header is a value object containing the basic information of a block
 */
class BlockHeader {
    /**
     *
     * @param {string} coinbase
     * @param {string} parentHash
     * @param {string} version
     */
    constructor(coinbase, parentHash, version) {
        this.coinbase = coinbase;
        this.parentHash = parentHash;
        this.version = version;
        this.timeStamp = Date.now();
        this.blockHash = null;
    }

    /**
     * Calculates the blockHash of the block this header belongs to with the provided blockData
     * @param {Transaction[]} blockData
     * @return {string} hash
     */
    calculateBlockHash(blockData) {
        // Create local variables to insert into nacl.
        let coinbase = this.coinbase;
        let parentHash = this.parentHash;
        let version = this.version;
        let timeStamp = this.timeStamp;

        let hash = '0';
        if (this.isValidHeaderData(blockData)) {
            hash = Security.hash(coinbase + parentHash + version + timeStamp + blockData);
        }

        return hash;
    }

    /**
     * Checks if the property data + provided blockData is valid to calculate the blockHash
     * @param {Transaction[]} blockData
     * @return {boolean}
     */
    isValidHeaderData(blockData) {
        return this.coinbase != null && this.parentHash != null && this.version != null && this.timeStamp <= Date.now() && blockData instanceof Array;
    }
}

module.exports = BlockHeader;
