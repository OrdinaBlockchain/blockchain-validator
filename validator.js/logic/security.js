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
    let signPrivKey = HexStringToByteArray(privKey);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        // Sign message and package up into packet
        signatureBin = nacl.crypto_sign(msgBytes, signPrivKey);
        Debug('Signature:           ' + nacl.to_hex(signatureBin));
    });

    return signatureBin;
}

function SignDetached(message, privKey) {
    let signatureDetachedBin;
    let signPrivKey = HexStringToByteArray(privKey);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        // Sign message and package up into packet
        signatureDetachedBin = nacl.crypto_sign_detached(msgBytes, signPrivKey);

        Debug('Signature:           ' + nacl.to_hex(signatureDetachedBin));
    });


    return signatureDetachedBin;
}

function MessageToBytes(message) {
    return Buffer.from(message, 'utf8');
}

function Verify(signatureBin, pubKey) {
    let message = '';
    let signPubKey = HexStringToByteArray(pubKey);

    naclFacotry.instantiate(function(nacl) {
        // Decode message from packet with public key
        let hexString = nacl.to_hex(nacl.crypto_sign_open(signatureBin, signPubKey)).toString();

        // Convert hex to string
        for (let i = 0; i < hexString.length; i += 2) {
message += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
}
    });
    // Debug('Text:              ' + message);

    return message;
}

function VerifyDetached(message, signatureBin, pubKey) {
    let result;
    let signPubKey = HexStringToByteArray(pubKey);

    naclFacotry.instantiate(function(nacl) {
        // Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        // Decode message from packet with public key
        result = nacl.crypto_sign_verify_detached(signatureBin, msgBytes, signPubKey);
    });
    Debug('Result:              ' + result);

    return result;
}

function GenerateMnemonic() {
    let msg = bip39.generateMnemonic();
    Debug(msg);
    return msg;
}

function GenerateKeyPair(mnemonic) {
    let public;
    let private;

    naclFacotry.instantiate(function(nacl) {
        // Generate private(signSk) and public(signPk) key
        let {signPk, signSk} = nacl.crypto_sign_seed_keypair(bip39.mnemonicToEntropy(mnemonic));

        public = nacl.to_hex(signPk);
        private = nacl.to_hex(signSk);
    });

    Debug('Public Key:          ' + public);
    Debug('Private Key:         ' + private);


    return {public, private};
}

function GenerateAddress(pubKey) {
    let signPubKey = HexStringToByteArray(pubKey);
    let address;

    naclFacotry.instantiate(function(nacl) {
        // Hash public key, take first 8 bytes
        let hash = Buffer.from(nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(signPubKey)))
            .slice(0, 11);

        // Start with SNOW followed by the hex of the bytes
        address = 'SNOW' + nacl.to_hex(hash);
    });
    Debug('Address:            ' + address);
    return address;
}

function HexStringToByteArray(hexString) {
    if (!hexString) {
        return new Uint8Array();
      }

      let a = [];
      for (let i = 0, len = hexString.length; i < len; i+=2) {
        a.push(parseInt(hexString.substr(i, 2), 16));
      }

      return new Uint8Array(a);
}

function Debug(message) {
    if (verbose) {
console.log(message);
}
}

function Hash(hexString) {
    let messageBin = HexStringToByteArray(hexString);
    let hash;

    naclFacotry.instantiate(function(nacl) {
        // Hash public key, take first 11 bytes
        hash = nacl.to_hex(nacl.crypto_hash_sha256(messageBin));
    });

    return hash;
}

module.exports =
    {
        Sign: Sign,
        Verify: Verify,
        SignDetached: SignDetached,
        VerifyDetached: VerifyDetached,
        GenerateMnemonic: GenerateMnemonic,
        GenerateKeyPair: GenerateKeyPair,
        GenerateAddress: GenerateAddress,
        Hash: Hash,
    }
;
