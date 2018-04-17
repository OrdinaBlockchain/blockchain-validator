let BlockHeader = require('./blockheader.js');

/**
 * Block is a value object containing the list of Transactions.
 */
class Block {
    /**
     * @param {*} data
     */
    constructor(data) {
        this.transactions = [];
        if (data.constructorVersion === 1) {
            this.header = new BlockHeader(data);
            this.BLOCK_REWARD = 50;
        } else {
            this.deserialize(data);
        }
    }

    /**
     * Reads the Block from a JSON file, and deserializes it back to a Block Object.
     * @param data
     */
    deserialize(data) {
        let currentBlock = data.block;
        let headerData = {
            constructorVersion: 2,
            header: currentBlock.header
        };

        this.header = new BlockHeader(headerData);
        this.BLOCK_REWARD = currentBlock.BLOCK_REWARD;

        for (let i = 0; i < currentBlock.transactions.length; i++) {
            this.transactions.push(new Transaction(currentBlock.transactions[i]))
        }
    }

    /**
     * Adds Transaction to list of block Transactions.
     * Transaction should already be checked for validity by Blockchain class,
     * since Block does not have access to all information.
     * @param {*} transaction
     */
    addTransaction(transaction) {
        // Only add new Transactions if the block is not already finished.
        if (this.header.blockHash === '0' || this.header.blockHash === null) {
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
        return this.header.blockHash === this.header.calculateBlockHash(this.transactions);
    }

    /**
     * Gets the balance of an address for this block.
     * @param address
     * @param depth
     * @returns {number}
     */
    getBlockBalanceOf(address, depth) {
        let balance = 0;
        // Check coinbase Transactions
        if (this.header.coinbase === address && depth > 0) {
            balance += this.BLOCK_REWARD;
        }

        for (let j = 0; j < this.transactions.length; j++) {
            let currentTransaction = this.transactions[j];

            // Check incoming balance.
            if (currentTransaction._receiveraddress === address) {
                balance += currentTransaction._amount;
            }

            // Check outgoing balance.
            if (currentTransaction._senderpubkey === address) {
                balance -= currentTransaction._amount;
            }
        }

        return balance;
    }
}

module.exports = Block;
