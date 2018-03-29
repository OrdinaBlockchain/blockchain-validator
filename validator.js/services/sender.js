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
        const message = new Message(this.node, 'request_default_peerlist');
        this.node.broadcast.write(JSON.stringify(message));
    }

    /**
     *
     * @param {*} peers
     * @param {*} recipient
     */
    sendDefaultPeerList(peers, recipient) {
        const message = new Message(this.node, 'retreived_default_peerlist', {
            peers: peers,
        });
        message.addRecipient(recipient);
        this.node.broadcast.write(JSON.stringify(message));
    }

    /** */
    introduceNodeToNetwork() {
        const message = new Message(this.node, 'new_node');
        this.node.broadcast.write(JSON.stringify(message));
    }
}

module.exports = Sender;
