var Transaction = require("./transaction.js");
var BlockHeader = require("./blockheader.js");
var Block = require("./block.js");

/**
 * Blockchain is a value object containing the list of all Blocks.
 */
class Blockchain {

    constructor(coinbase, version) {
        this.blocks = [];
        this.coinbase = coinbase;
        this.version = version;
        this.currentBlock = new Block(coinbase, "0", version)
    }

    /**
     * Adds Transaction to currentBlock if it is valid.
     * @param transaction
     */
    addTransaction(transaction) {
        if (isValidTransaction(transaction)) {
            this.currentBlock.addTransaction(transaction);
        }
    }

    /**
     * Returns whether or not a Transaction is valid.
     * @param transaction
     * @returns {boolean}
     */
    isValidTransaction(transaction) {
        // TODO check if transaction is valid.
        let valid = transaction instanceof Transaction;

        return valid;
    }

    /**
     * Adds Block to the Array of Blocks if it is valid.
     * @param block
     */
    addBlock(block) {
        if (this.isValidBlock(block)) {
            this.blocks.push(block);
        }
    }

    /**
     * Returns whether or not a Block is valid.
     * @param block
     * @returns {boolean}
     */
    isValidBlock(block) {
        // TODO check if block is valid. Check currentBlock.timeStamp > previousBlock.timestamp.
        return block instanceof Block;
    }

    /**
     * Returns whether or not the Blockchain is valid.
     * @returns {boolean}
     */
    isValid() {
        let previousHash = "0"; // Set previousHash to "0" for first block.
        for (let i = 0; i < this.blocks.length; i++) {
            let currentBlock = this.blocks[i];

            // Chain is not valid if the currentBlock.previousHash !== blockHash of the previous block.
            if (currentBlock.previousHash !== previousHash) {
                return false;
            }
            previousHash = currentBlock.hash;

            // Chain is not valid if >0 blocks are invalid.
            if (!this.isValidBlock(currentBlock)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns latest Block
     * @returns {Block}
     */
    getLatestBlock() {
        if (this.blocks.length > 0) {
            return this.blocks[this.blocks.length - 1];
        }
    }
}

module.exports = Blockchain;
