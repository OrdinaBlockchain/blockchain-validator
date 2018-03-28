const RegistrationMessage = require('../models/registrationMessage');
const IntroductionMessage = require('../models/introductionMessage');

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

    /**
     *
     * @param {*} host
     * @param {*} port
     */
    introduceNewNode(host, port) {
        const message = new IntroductionMessage(this.node);
        this.node.broadcast.write(JSON.stringify(message));
    }
}

module.exports = Sender;
