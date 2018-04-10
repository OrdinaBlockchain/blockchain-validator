let BlockHeader = require('./blockheader.js');

/**
 * Block is a value object containing the list of Transactions.
 */
class Block {
    /**
     *
     * @param {*} coinbase
     * @param {*} parentHash
     * @param {*} version
     */
    constructor(coinbase, parentHash, version) {
        this.transactions = [];
        this.header = new BlockHeader(coinbase, parentHash, version);
        this.BLOCK_REWARD = 50;
    }

    /**
     * Adds Transaction to list of block Transactions.
     * Transaction should already be checked for validity by Blockchain class,
     * since Block does not have access to all information.
     * @param {*} transaction
     */
    addTransaction(transaction) {
        // Only add new Transactions if the block is not already finished.
        if (this.header.blockHash === '0' || this.header.blockHash === undefined) {
            this.transactions.push(transaction);
        }
    }

    /**
     * Sets the header's blockHash.
     */
    calculateBlockHash() {
        this.header.blockHash = this.header.calculateBlockHash(this.transactions);
    }

    /**
     * Recalculates the blockHash with the current Array of Transactions,
     * and compares it to the blockHash in the header.
     * @return {boolean}
     */
    hasValidHeader() {
        return this.header.calculateBlockHash(this.transactions) === this.header.blockHash;
    }
}

module.exports = Block;
