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
        return new Promise((resolve, reject) => {
            naclFactory.instantiate((nacl) => {
                // Convert message to bytestring
                const messagBytes = this.messageToBytes(message);

                // Sign message and package up into packet
                const signatureBin = nacl.crypto_sign(messagBytes, this.hexToBytes(privateKey));
                this.debug(`Signature: ${nacl.to_hex(signatureBin)}`);

                resolve(signatureBin);
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
        return new Promise((resolve, reject) => {
            naclFactory.instantiate((nacl) => {
                try {
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
     * @param {string} signatureBin
     * @param {string} pubKey
     * @return {string} message
     */
    static verify(signatureBin, pubKey) {
        let message = '';
        let signPubKey = this.hexToBytes(pubKey);

        naclFactory.instantiate((nacl) => {
            // Decode message from packet with public key
            let hexString = nacl.to_hex(nacl.crypto_sign_open(signatureBin, signPubKey)).toString();

            // Convert hex to string
            for (let i = 0; i < hexString.length; i += 2) {
                message += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
            }
        });

        return message;
    }

    /**
     *
     * @param {string} message
     * @param {string} signature
     * @param {string} pubKey
     * @return {*} result
     */
    static verifyDetached(message, signature, pubKey) {
        let result;
        let signPubKey = this.hexToBytes(pubKey);
        let signatureBin = this.hexToBytes(signature);

        // extract data from message without the signature.
        let data = {
            senderpubkey: message.senderpubkey,
            receiveraddress: message.receiveraddress,
            amount: message.amount,
            timestamp: message.timestamp,
        };

        naclFactory.instantiate((nacl) => {
            // Convert message to bytestring
            const msgBytes = this.messageToBytes(JSON.stringify(data));

            // Decode message from packet with public key
            result = nacl.crypto_sign_verify_detached(signatureBin, msgBytes, signPubKey);
        });
        this.debug('Result:              ' + result);

        return result;
    }

    /**
     * @return {string} mnemonicString
     */
    static generateMnemonic() {
        let msg = bip39.generateMnemonic();
        this.debug(msg);
        return msg;
    }

    /**
     *
     * @param {string} mnemonic
     * @return {*} keypair
     */
    static generateKeyPair(mnemonic) {
        let pubKey;
        let privKey;

        naclFactory.instantiate(function(nacl) {
            // Generate private(signSk) and public(signPk) key
            let {signPk, signSk} = nacl.crypto_sign_seed_keypair(bip39.mnemonicToEntropy(mnemonic));

            pubKey = nacl.to_hex(signPk);
            privKey = nacl.to_hex(signSk);
        });

        this.debug('Public Key:          ' + pubKey);
        this.debug('Private Key:         ' + privKey);

        return {pubKey, privKey};
    }

    /**
     *
     * @param {string} pubKey
     * @return {string} address
     */
    static generateAddress(pubKey) {
        let signPubKey = this.hexToBytes(pubKey);
        let address;

        naclFactory.instantiate((nacl) => {
            // Hash public key, take first 8 bytes
            let hash = Buffer.from(nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(signPubKey)))
                .slice(0, 11);

            // Start with SNOW followed by the hex of the bytes
            address = 'SNOW' + nacl.to_hex(hash);
        });
        this.debug('Address:            ' + address);
        return address;
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
        if (verbose) {
            console.log(message);
        }
    }

    /**
     *
     * @param {string} toHash
     * @return {*} hash
     */
    static hash(toHash) {
        let hash;

        naclFactory.instantiate((nacl) => {
            // Hash public key, take first 11 bytes
            hash = nacl.to_hex(nacl.crypto_hash_sha256(toHash));
        });

        return hash;
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
