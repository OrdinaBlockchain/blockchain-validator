let Transaction = require('./transaction.js');
let Block = require('./block.js');

/**
 * Blockchain is a value object containing the list of all Blocks.
 */
class Blockchain {
    /**
     * Constructor for Blockchain.
     * @param {string} coinbase
     * @param {string} version
     */
    constructor(coinbase, version) {
        this.blocks = [];
        this.coinbase = coinbase;
        this.version = version;
        this.currentBlock = new Block(coinbase, '0', version);
    }

    /**
     * Adds Transaction to currentBlock if it is valid.
     * @param {Transaction} transaction
     */
    addTransaction(transaction) {
        if (this.isValidTransaction(transaction)) {
            this.currentBlock.addTransaction(transaction);
        }
    }

    /**
     * Returns whether or not a Transaction is valid.
     * @param {Transaction} transaction
     * @return {boolean}
     */
    isValidTransaction(transaction) {
        // TODO check if address is a correct address
        let isTransaction = transaction instanceof Transaction;
        let hasFunds = this.getBalanceOf(transaction._senderpubkey) >= transaction._amount;

        return isTransaction && hasFunds;
    }

    /**
     * Adds Block to the Array of Blocks if it is valid.
     * @param {Block} block
     */
    addBlock(block) {
        block.calculateBlockHash();
        if (this.isValidBlock(block)) {
            this.blocks.push(block);
        }
    }

    /**
     * Returns whether or not a Block is valid.
     * @param {Block} block
     * @return {boolean}
     */
    isValidBlock(block) {
        // TODO check if block is valid. Check currentBlock.timeStamp > previousBlock.timestamp.
        return block instanceof Block && block.hasValidHeader();
    }

    /**
     * Returns whether or not the Blockchain is valid.
     * @return {boolean}
     */
    isValid() {
        let parentHash = '0'; // Set parentHash to "0" for first block.
        for (let i = 0; i < this.blocks.length; i++) {
            let currentBlock = this.blocks[i];

            // Chain is not valid if the currentBlock.parentHash !== blockHash of the previous block.
            if (currentBlock.header.parentHash !== parentHash) {
                return false;
            }
            parentHash = currentBlock.header.blockHash;

            // Chain is not valid if >0 blocks are invalid.
            if (!this.isValidBlock(currentBlock)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns latest Block
     * @return {Block}
     */
    getLatestBlock() {
        if (this.blocks.length > 0) {
            return this.blocks[this.blocks.length - 1];
        }
    }

    /**
     * Calculates and returns balance of an address.
     * @param {string} address
     * @return {number} balance
     */
    getBalanceOf(address) {
        let currentBlock = null;
        let balance = 0;
        let currentTransaction = null;

        for (let i = 0; i < this.blocks.length; i++) {
            currentBlock = this.blocks[i];

            // Check coinbase Transactions
            if (currentBlock.header.coinbase === address) {
                balance += currentBlock.BLOCK_REWARD;
            }

            for (let j = 0; j < currentBlock.transactions.length; j++) {
                currentTransaction = currentBlock.transactions[j];

                // Check incoming balance.
                if (currentTransaction._receiveraddress === address) {
                    balance += currentTransaction._amount;
                }

                // Check outgoing balance.
                if (currentTransaction._senderpubkey === address) {
                    balance -= currentTransaction._amount;
                }
            }
        }

        return balance;
    }
}

module.exports = Blockchain;
