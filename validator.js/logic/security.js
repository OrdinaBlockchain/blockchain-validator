const bip39 = require('bip39');
const naclFacotry = require('js-nacl');
const verbose = true;

/**
 *
 * @param {*} message
 * @param {*} privKey
 * @return {*}
 */
function Sign(message, privKey) {
    let signatureBin;
    let signPrivKey = hexStringToByteArray(privKey);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = messageToBytes(message);

        // Sign message and package up into packet
        signatureBin = nacl.crypto_sign(msgBytes, signPrivKey);
        debug('Signature:           ' + nacl.to_hex(signatureBin));
    });

    return signatureBin;
}

/**
 *
 * @param {string} message
 * @param {string} privKey
 * @return {string} signature
 */
function signDetached(message, privKey) {
    let signatureDetached;
    let signPrivKey = hexStringToByteArray(privKey);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = messageToBytes(message);

        // Sign message and package up into packet
        let signatureDetachedBin = nacl.crypto_sign_detached(msgBytes, signPrivKey);
        signatureDetached = nacl.to_hex(signatureDetachedBin);

        debug('Signature:           ' + signatureDetached);
    });

    return signatureDetached;
}

/**
 *
 * @param {string} message
 * @return {*} buffer
 */
function messageToBytes(message) {
    return Buffer.from(message, 'utf8');
}

/**
 *
 * @param {string} signatureBin
 * @param {string} pubKey
 * @return {string} message
 */
function verify(signatureBin, pubKey) {
    let message = '';
    let signPubKey = hexStringToByteArray(pubKey);

    naclFacotry.instantiate(function(nacl) {
        // Decode message from packet with public key
        let hexString = nacl.to_hex(nacl.crypto_sign_open(signatureBin, signPubKey)).toString();

        // Convert hex to string
        for (let i = 0; i < hexString.length; i += 2) {
message += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
}
    });
    // debug('Text:              ' + message);

    return message;
}

/**
 *
 * @param {string} message
 * @param {string} signature
 * @param {string} pubKey
 * @return {bool} result
 */
function verifyDetached(message, signature, pubKey) {
    let result;
    let signPubKey = hexStringToByteArray(pubKey);
    let signatureBin = hexStringToByteArray(signature);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = messageToBytes(message);

        // Decode message from packet with public key
        result = nacl.crypto_sign_verify_detached(signatureBin, msgBytes, signPubKey);
    });
    debug('Result:              ' + result);

    return result;
}

/**
 * @return {string} mnemonicString
 */
function generateMnemonic() {
    let msg = bip39.generateMnemonic();
    debug(msg);
    return msg;
}

/**
 *
 * @param {string} mnemonic
 * @return {*} keypair
 */
function GenerateKeyPair(mnemonic) {
    let public;
    let private;

    naclFacotry.instantiate(function(nacl) {
        // Generate private(signSk) and public(signPk) key
        let {signPk, signSk} = nacl.crypto_sign_seed_keypair(bip39.mnemonicToEntropy(mnemonic));

        public = nacl.to_hex(signPk);
        private = nacl.to_hex(signSk);
    });

    debug('Public Key:          ' + public);
    debug('Private Key:         ' + private);


    return {public, private};
}

function GenerateAddress(pubKey) {
    let signPubKey = hexStringToByteArray(pubKey);
    let address;

    naclFacotry.instantiate(function(nacl) {
        // Hash public key, take first 8 bytes
        let hash = Buffer.from(nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(signPubKey)))
            .slice(0, 11);

        // Start with SNOW followed by the hex of the bytes
        address = 'SNOW' + nacl.to_hex(hash);
    });
    debug('Address:            ' + address);
    return address;
}

function hexStringToByteArray(hexString) {
    if (!hexString) {
        return new Uint8Array();
      }

      let a = [];
      for (let i = 0, len = hexString.length; i < len; i+=2) {
        a.push(parseInt(hexString.substr(i, 2), 16));
      }

      return new Uint8Array(a);
}

function debug(message) {
    if (verbose) {
console.log(message);
}
}

function Hash(toHash) {
    let hash;

    nacl_factory.instantiate(function(nacl) {
        // Hash public key, take first 11 bytes
        hash = nacl.to_hex(nacl.crypto_hash_sha256(toHash));
    });

    return hash;
}

module.exports =
    {
        Sign: Sign,
        verify: verify,
        signDetached: signDetached,
        verifyDetached: verifyDetached,
        generateMnemonic: generateMnemonic,
        GenerateKeyPair: GenerateKeyPair,
        GenerateAddress: GenerateAddress,
        Hash: Hash,
    }
;
