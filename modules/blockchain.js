let Transaction = require('./transaction.js');
let Block = require('./block.js');
let fs = require('fs');

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
        this.deserialize();
        this.coinbase = coinbase;
        this.version = version;
        let data = {
            constructorVersion: 1,
            coinbase: this.coinbase,
            parentHash: this.getLatestBlock().header.blockHash,
            version: this.version,
        };

        this.currentBlock = new Block(data);
    }

    /**
     * Reads the Blockchain from a JSON file, and deserializes it back to a Blockchain Object.
     */
    deserialize() {
        let storedChain = JSON.parse(fs.readFileSync('blockchain_storage.json', 'utf8')); // Read stored chain from stored file.
        for (let i = 0; i < storedChain.blocks.length; i++) {
            let data = {
                constructorVersion: 2,
                block: storedChain.blocks[i],
            };
            let newBlock = new Block(data);
            this.blocks.push(newBlock);
        }
    }

    /**
     * Adds Transaction to currentBlock if it is valid.
     * @param {Transaction} transaction
     */
    addTransaction(transaction) {
        if (this.isValidTransaction(transaction)) {
            this.currentBlock.addTransaction(transaction);
        }

        // TODO remove when other block limit is implemented
        if (this.currentBlock.transactions.length > 9) {
            this.addBlock(this.currentBlock);
            let data = {
                constructorVersion: 1,
                coinbase: this.coinbase,
                version: this.version,
                parentHash: this.getLatestBlock().header.blockHash,
            };

            this.currentBlock = new Block(data);
        }
    }

    /**
     * Returns whether or not a Transaction is valid.
     * @param {Transaction} transaction
     * @return {boolean}
     */
    isValidTransaction(transaction) {
        // TODO check if address is a correct addressb
        if (this.validateTransactionFormat(transaction) && transaction.verifySignature()) {
            return this.getBalanceOf(transaction._senderpubkey) >= transaction._amount;
        }
        return false;
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
                console.log('1');
                return false;
            }
            parentHash = currentBlock.header.blockHash;

            // Chain is not valid if >0 blocks are invalid.
            if (!this.isValidBlock(currentBlock)) {
                console.log('2');
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

        // Check all blocks for Transactions
        for (let i = 0; i < this.blocks.length; i++) {
            currentBlock = this.blocks[i];
            // TODO to 2 methods: Transactions & coinbase Transactions
            balance += currentBlock.getBlockBalanceOf(address, this.blocks.length - i);
        }

        // Check for Transactions in current block.
        balance += this.currentBlock.getBlockBalanceOf(address, 0);
        return balance;
    }

    /**
     * Calculates and returns balance of an address.
     * @param {json} transaction
     * @return {bool} isValid
     */
    validateTransactionFormat(transaction) {
        if (transaction instanceof Transaction) {
            return true;
        }
        return false;
    }
}

module.exports = Blockchain;
