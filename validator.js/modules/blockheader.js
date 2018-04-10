const naclFactory = require('js-nacl');

/**
 * Block header is a value object containing the basic information of a block
 */
class Blockheader {
    /**
     *
     * @param {*} coinbase
     * @param {*} parentHash
     * @param {*} version
     * @param {*} blockData
     */
    constructor(coinbase, parentHash, version, blockData) {
        this.coinbase = coinbase;
        this.parentHash = parentHash;
        this.version = version;
        this.timeStamp = Date();
        this.hash = this.calculateBlockHash(blockData);
    }

    /**
     * Calculates the hash of the block this header belongs to with the provided blockData
     * @param {*} blockData
     */
    calculateBlockHash(blockData) {
        let coinbase = this.coinbase;
        let parentHash = this.parentHash;
        let version = this.version;
        let timeStamp = this.timeStamp;

        naclFactory.instantiate(function(nacl) {
            console.log(nacl.to_hex(nacl.crypto_hash_sha256(coinbase + parentHash + version + timeStamp + blockData)));
        });
    }
}

module.exports = Blockheader;
