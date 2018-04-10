let bip39 = require('bip39');
let nacl_factory = require('js-nacl');
let verbose = true;

function Sign(message, privKey) {
    var signatureBin;
    var signPrivKey = HexStringToByteArray(privKey);

    nacl_factory.instantiate(function (nacl) {
        //Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        //Sign message and package up into packet
        signatureBin = nacl.crypto_sign(msgBytes, signPrivKey);
        Debug('Signature:           ' + nacl.to_hex(signatureBin));
    });

    return signatureBin;
}

function SignDetached(message, privKey) {
    var signatureDetachedBin;
    var signPrivKey = HexStringToByteArray(privKey);

    nacl_factory.instantiate(function (nacl) {
        //Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        //Sign message and package up into packet
        signatureDetachedBin = nacl.crypto_sign_detached(msgBytes, signPrivKey);

        Debug('Signature:           ' + nacl.to_hex(signatureDetachedBin));
    });
    

    return signatureDetachedBin;
}

function MessageToBytes(message) {
    return Buffer.from(message, 'utf8');
}

function Verify(signatureBin, pubKey) {
    var message = '';
    var signPubKey = HexStringToByteArray(pubKey);

    nacl_factory.instantiate(function (nacl) {
        //Decode message from packet with public key
        var hexString = nacl.to_hex(nacl.crypto_sign_open(signatureBin, signPubKey)).toString();

        //Convert hex to string
        for (var i = 0; i < hexString.length; i += 2)
            message += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
    });
    //Debug('Text:              ' + message);

    return message;
}

function VerifyDetached(message, signatureBin, pubKey) {
    var result;
    var signPubKey = HexStringToByteArray(pubKey);

    nacl_factory.instantiate(function (nacl) {
        //Convert message to bytestring
        const msgBytes = MessageToBytes(message);

        //Decode message from packet with public key
        result = nacl.crypto_sign_verify_detached(signatureBin, msgBytes, signPubKey);
    });
    Debug('Result:              ' + result);

    return result;
}

function GenerateMnemonic() {
    var msg = bip39.generateMnemonic();
    Debug(msg);
    return msg;
}

function GenerateKeyPair(mnemonic) {
    var public;
    var private;

    nacl_factory.instantiate(function (nacl) {
        //Generate private(signSk) and public(signPk) key
        var { signPk, signSk } = nacl.crypto_sign_seed_keypair(bip39.mnemonicToEntropy(mnemonic))

        public = nacl.to_hex(signPk);
        private = nacl.to_hex(signSk);
        
    });

    Debug('Public Key:          ' + public);
    Debug('Private Key:         ' + private);



    return { public, private };
}

function GenerateAddress(pubKey) {
    var signPubKey = HexStringToByteArray(pubKey);
    var address;

    nacl_factory.instantiate(function (nacl) {
        //Hash public key, take first 8 bytes
        var hash = Buffer.from(nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(signPubKey)))
            .slice(0, 11);

        //Start with SNOW followed by the hex of the bytes
        address = 'SNOW' + nacl.to_hex(hash);
    });
    Debug('Address:            ' + address);
    return address;
}

function HexStringToByteArray(hexString){
    if (!hexString) {
        return new Uint8Array();
      }
      
      var a = [];
      for (var i = 0, len = hexString.length; i < len; i+=2) {
        a.push(parseInt(hexString.substr(i,2),16));
      }
      
      return new Uint8Array(a);
}

function Debug(message) {
    if (verbose)
        console.log(message)
}

module.exports =
    {
        Sign: Sign,
        Verify: Verify,
        SignDetached: SignDetached,
        VerifyDetached: VerifyDetached,
        GenerateMnemonic: GenerateMnemonic,
        GenerateKeyPair: GenerateKeyPair,
        GenerateAddress: GenerateAddress
    }