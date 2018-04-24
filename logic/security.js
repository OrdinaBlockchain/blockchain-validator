const bip39 = require('bip39');
const naclFactory = require('js-nacl');
const verbose = true;

/**
 *
 */
class Security {
    /**
     *
     */
    constructor() { }

    /**
     *
     * @param {*} message
     * @param {*} privKey
     * @return {*}
     */
    static sign(message, privKey) {
        let signatureBin;
        let signPrivKey = this.hexStringToByteArray(privKey);

        naclFactory.instantiate((nacl) => {
            // Convert message to bytestring
            const msgBytes = this.messageToBytes(message);

            // Sign message and package up into packet
            signatureBin = nacl.crypto_sign(msgBytes, signPrivKey);
            this.debug('Signature:           ' + nacl.to_hex(signatureBin));
        });

        return signatureBin;
    }

    /**
     *
     * @param {string} message
     * @param {string} privKey
     * @return {string} signature
     */
    static signDetached(message, privKey) {
        let signatureDetached;
        let signPrivKey = this.hexStringToByteArray(privKey);

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

            // Sign message and package up into packet
            let signatureDetachedBin = nacl.crypto_sign_detached(msgBytes, signPrivKey);
            signatureDetached = nacl.to_hex(signatureDetachedBin);

            this.debug('Signature:           ' + signatureDetached);
        });

        return signatureDetached;
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
        let signPubKey = this.hexStringToByteArray(pubKey);

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
        let signPubKey = this.hexStringToByteArray(pubKey);
        let signatureBin = this.hexStringToByteArray(signature);

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
        let signPubKey = this.hexStringToByteArray(pubKey);
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
     *
     * @param {string} hexString
     * @return {*} array
     */
    static hexStringToByteArray(hexString) {
        if (!hexString) {
            return new Uint8Array(); // eslint-disable-line no-undef
        }

        let a = [];
        for (let i = 0, len = hexString.length; i < len; i+=2) {
            a.push(parseInt(hexString.substr(i, 2), 16));
        }

        return new Uint8Array(a); // eslint-disable-line no-undef
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
}

module.exports = Security;
