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

    addTransaction(transaction) {
        if (isValidTransaction(transaction)) {
            this.currentBlock.addTransaction(transaction);
        }
    }

    isValidTransaction(transaction) {
        // TODO check if transaction is valid.
        let valid = transaction instanceof Transaction;

        return valid;
    }

    addBlock(block) {
        if (Blockchain.isValidBlock(block)) {
            this.blocks.push(block);
        }
    }

    isValidBlock(block) {
        // TODO check if block is valid. Check currentBlock.timeStamp > previousBlock.timestamp.
        return block instanceof Block;
    }

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
            if (!Blockchain.isValidBlock(currentBlock)) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;