const naclFactory = require('js-nacl');

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
        this.hash = this.calculateBlockHash(blockData);
    }

    /**
     * Calculates the hash of the block this header belongs to with the provided blockData
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
            nacl_factory.instantiate(function (nacl) {
                hash = nacl.to_hex(nacl.crypto_hash_sha256(coinbase + parentHash + version + timeStamp + blockData));
            });
        }

        return hash;
    }

    /**
     * Checks if the property data + provided blockData is valid to calculate the hash
     * @param blockData
     * @returns {bool}
     */
    isValidHeaderData(blockData) {
        return this.coinbase && this.parentHash && this.version && this.timeStamp && blockData;
        naclFactory.instantiate(function(nacl) {
            console.log(nacl.to_hex(nacl.crypto_hash_sha256(coinbase + parentHash + version + timeStamp + blockData)));
        });
    }
}

module.exports = Blockheader;
