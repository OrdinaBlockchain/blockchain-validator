const sec = require('../logic/security');

/**
 * Block header is a value object containing the basic information of a block
 */
class Blockheader {

    /**
     *
     * @param {string} coinbase
     * @param {string} parentHash
     * @param {string} version
     * @param {*} blockData
     */
    constructor(coinbase, parentHash, version, blockData) {
        this.coinbase = coinbase;
        this.parentHash = parentHash;
        this.version = version;
        this.timeStamp = Date();
        this.blockHash = this.calculateBlockHash(blockData);
    }

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
        this.timeStamp = Date();
    }

    /**
     * Calculates the blockHash of the block this header belongs to with the provided blockData
     * @param {*} blockData
     */
    calculateBlockHash(blockData) {
        // Create local variables to insert into nacl.
        let coinbase = this.coinbase;
        let parentHash = this.parentHash;
        let version = this.version;
        let timeStamp = this.timeStamp;

        let hash = "0";
        if (this.isValidHeaderData(blockData)) {
            hash = sec.Hash(coinbase + parentHash + version + timeStamp + blockData);
        }

        return hash;
    }

    /**
     * Checks if the property data + provided blockData is valid to calculate the blockHash
     * @param blockData
     * @returns {boolean}
     */
    isValidHeaderData(blockData) {
        return this.coinbase && this.parentHash && this.version && this.timeStamp && blockData;
    }
}

module.exports = Blockheader;
