var Transaction = require("./transaction.js");
var BlockHeader = require("./blockheader.js");
var Block = require("./block.js");

/**
 * Blockchain is a value object containing the list of all Blocks.
 */
class Blockchain {

    constructor() {
        this.blocks = [];
    }

    addBlock(block) {
        if (Blockchain.isValidBlock(block)) {
            this.blocks.push(block);
        }
    }

    static isValidBlock(block) {
        // TODO check if block is valid. Check currentBlock.timeStamp > previousBlock.timestamp.
        return block instanceof Block;
    }

    isValid() {
        let previousHash = "0"; // Set previousHash to "0" for first block.
        for (let i = 0; i < this.blocks.length; i++) {
            let currentBlock = this.blocks[i];

            // Chain is not valid if the currentBlock.previousHash !== hash of the previous block.
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
