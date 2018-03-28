/**
 * Receives messages from the network the node is connected to
 */
class Receiver {
    /**
     *  Node that receives messages
     * @param {Sender} sender
     * @param {Node} node
     */
    constructor(sender, node) {
        this.sender = sender;
        this.node = node;

        this.initDefaultListeners();
    }

    /**
     * Initialize default listeners that listen to network messages
    */
    initDefaultListeners() {
        this.node.on('connect', () => {
            console.log('Welcome %s!\nYou just made your first connection with the frozen network! :)', this.node.id);
        });

        this.node.on('disconnect', () => {
          console.log('Disconnected');
        });

        this.node.on('error', (e) => {
            console.log(e);
            throw e;
        });
    }

    /**
     * Initialize custom listeners that listen to network messages
    */
    initCustomListeners() {
        // todo
    }
}

module.exports = Receiver;
