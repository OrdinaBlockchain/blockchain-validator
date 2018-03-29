const Message = require('../models/registrationMessage');

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
        this.init();
    }

    /** */
    init() {
        const message = new Message();
        console.log(JSON.stringify(message));
    }
}

module.exports = Sender;
