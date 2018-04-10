const Message = require('../models/message.js');

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
    requestDefaultPeerList() {
        const message = new Message(this.node, 'request_peers', {
            recipientId: this.node.id,
        });
        this.node.broadcast.write(JSON.stringify(message));
    }

    /**
     *
     * @param {{}[]} peers
     * @param {string} recipientId
     */
    sendDefaultPeerList(peers, recipientId) {
        const message = new Message(this.node, 'reply_peers', {
            peers: peers,
        });
        message.addRecipient(recipientId);
        this.node.broadcast.write(JSON.stringify(message));
    }
}

module.exports = Sender;
