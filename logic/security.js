const bip39 = require('bip39');
const naclFactory = require('js-nacl');
const util = require('util');

// For debugging (true = debug-mode, false=no debug)
const verbose = true;

/**
 * [Security description]
 */
class Security {
    /**
     * [sign description]
     * @param  {[json]} message    [description]
     * @param  {[string]} privateKey [description]
     * @return {[Promise]}            [description]
     */
    static sign(message, privateKey) {
        if (!message | !privateKey) throw new Error('invalid message');
        return new Promise((resolve, reject) => {
            naclFactory.instantiate((nacl) => {
                try {
                    // Convert and ensure data 
                    const data = this.createData(message);

                    // Convert data to bytestring
                    const messagBytes = this.messageToBytes(data);

                    // Sign message and package up into packet
                    const signatureBin = nacl.crypto_sign(messagBytes, this.hexToBytes(privateKey));
                    const signature = nacl.to_hex(signatureBin);

                    this.debug(`Signature: ${signature}`);

                    resolve(signature);
                } catch (err) {
                    reject(err);
                }
            });
        });

    }

    /**
     * [signDetached description]
     * @param  {[json]} message    [description]
     * @param  {[string]} privateKey [description]
     * @return {[Promise]}            [description]
     */
    static signDetached(message, privateKey) {
        if (!message | !privateKey) throw new Error('invalid message');
        return new Promise((resolve, reject) => {
            naclFactory.instantiate((nacl) => {
                try {
                    // Convert and ensure data 
                    const data = this.createData(message);

                    // Convert message to bytestring
                    const messageBytes = this.messageToBytes(JSON.stringify(data));

                    // Sign message and package up into packet
                    const detachedSignatureBin = nacl.crypto_sign_detached(messageBytes, this.hexToBytes(privateKey));
                    const detachedSignature = nacl.to_hex(detachedSignatureBin);
                    this.debug(`Signature: ${detachedSignature}`);

                    resolve(detachedSignature);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     *
     * @param {string} message
     * @return {*} buffer
     */
    static messageToBytes(message) {
        return Buffer.from(message, 'utf8');
    }

    /**
     *
     * @param {string} signature
     * @param {string} pubKey
     * @return {string} message
     */
    static verify(signature, pubKey) {
        if (!signature | !pubKey) throw new Error('invalid message');
        return new Promise((resolve, reject) => {

            let message = '';
            let signPubKey = this.hexToBytes(pubKey);
            let signatureBin = this.hexToBytes(this.signature);

            naclFactory.instantiate((nacl) => {
                try {
                    // Decode message from packet with public key
                    let hexString = nacl.to_hex(nacl.crypto_sign_open(signatureBin, signPubKey)).toString();

                    // Convert hex to string
                    for (let i = 0; i < hexString.length; i += 2) {
                        message += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
                    }
                    this.debug(`Message: ${message}`);
                    resolve(message);
                } catch (err) {
                    reject(err);
                }
            });
        });

    }

    /**
     *
     * @param {string} message
     * @param {string} signature
     * @param {string} pubKey
     * @return {*} result
     */
    static verifyDetached(message, signature, pubKey) {
        if (!message | !signature | !pubKey) throw new Error('invalid message');
        return new Promise((resolve, reject) => {
            let signPubKey = this.hexToBytes(pubKey);
            let signatureBin = this.hexToBytes(signature);

            // extract data from message without the signature.
            let data = this.createData(message);

            naclFactory.instantiate((nacl) => {
                try {
                    // Convert message to bytestring
                    const msgBytes = this.messageToBytes(JSON.stringify(data));

                    // Decode message from packet with public key
                    let result = nacl.crypto_sign_verify_detached(signatureBin, msgBytes, signPubKey);

                    this.debug(`Result: ${result}`);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * @return {string} mnemonicString
     */
    static generateMnemonic() {
        return new Promise((resolve, reject) => {
            //Generate random new keypair
            let mnemonic = bip39.generateMnemonic(); ///Maybe add seed or other wordlist to generating

            this.debug(`Mnemonic: ${mnemonic}`);
            resolve(mnemonic);
        });
    }

    /**
     *
     * @param {string} mnemonic
     * @return {*} keypair
     */
    static generateKeyPair(mnemonic) {
        if (!mnemonic) throw new Error('invalid message');
        return new Promise((resolve, reject) => {
            naclFactory.instantiate(function (nacl) {
                try {
                    // Generate private(signSk) and public(signPk) key
                    let { signPk, signSk } = nacl.crypto_sign_seed_keypair(bip39.mnemonicToEntropy(mnemonic));

                    let pubKey = nacl.to_hex(signPk);
                    let privKey = nacl.to_hex(signSk);

                    this.debug(`Public Key: ${pubKey}`);
                    this.debug(`Private Key: ${privKey}`);

                    resolve({ pubKey, privKey });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     *
     * @param {string} pubKey
     * @return {string} address
     */
    static generateAddress(pubKey) {
        if (!pubKey) throw new Error('invalid message');
        return new Promise((resolve, reject) => {
            let signPubKey = this.hexToBytes(pubKey);

            naclFactory.instantiate((nacl) => {
                try {

                    // Hash public key, take first 8 bytes
                    let hash = Buffer.from(nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(signPubKey)))
                        .slice(0, 11);

                    // Start with SNOW followed by the hex of the bytes
                    let address = 'SNOW' + nacl.to_hex(hash);

                    this.debug(`Address: ${address}`);

                    resolve(address);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * [hexToBytes description]
     * @param  {[string]} hex [description]
     * @return {[array]} byteArray    [description]
     */
    static hexToBytes(hex) {
        if (!hex) {
            return new Uint8Array(); // eslint-disable-line no-undef
        } else {
            let bytes = [];
            for (let i = 0, len = hex.length; i < len; i += 2) {
                bytes.push(parseInt(hex.substr(i, 2), 16));
            }
            return new Uint8Array(bytes); // eslint-disable-line no-undef
        }
    }

    /**
     *
     * @param {string} message
     */
    static debug(message) {
        if (verbose) console.log(message);
    }

    /**
     *
     * @param {string} toHash
     * @return {*} hash
     */
    static hash(toHash) {
        if(!toHash) throw new Error('invalid message'); 
        return new Promise((resolve, reject) => {
            naclFactory.instantiate((nacl) => {
                // Hash public key, take first 11 bytes
                let hash = nacl.to_hex(nacl.crypto_hash_sha256(toHash));

                resolve(hash);
            });
        });
    }

    /**
     * [createData description]
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */
    static createData(message) {
        if (message.senderpubkey && message.receiveraddress &&
            message.amount && message.timestamp) {
            return {
                senderpubkey: message.senderpubkey,
                receiveraddress: message.receiveraddress,
                amount: message.amount,
                timestamp: message.timestamp,
            };
        } else {
            throw new Error('invalid message');
        }
    }
}

module.exports = Security;
