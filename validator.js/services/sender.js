const RegistrationMessage = require('../models/registrationMessage');

/**
 * Receives messages from the network the node is connected to
 */
class Sender {
    /**
     *  Node that receives messages
     * @param {Node} node
     */
    constructor(node) {
        this.node = node;
    }

    /** */
    registeToNetwork() {
        const message = new RegistrationMessage(this.node);
        this.node.broadcast.write(JSON.stringify(message));
    }
}

module.exports = Sender;
