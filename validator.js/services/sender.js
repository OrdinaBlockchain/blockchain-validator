const Message = require('../modules/message.js');

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

    /**
     *
     */
    async requestPeers() {
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
    async sendPeers(peers, recipientId) {
        const message = new Message(this.node, 'reply_peers', {
            peers: peers,
        });
        message.addRecipient(recipientId);
        this.node.broadcast.write(JSON.stringify(message));
    }

    /**
     *
     * @param {*} transaction
     */
    async broadcastTransaction(transaction) {
        const message = new Message(this.node, 'new_transaction', {
            transaction: transaction,
        });
        this.node.broadcast.write(JSON.stringify(message));
    }
}

module.exports = Sender;
