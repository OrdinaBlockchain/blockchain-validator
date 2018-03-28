/**
 * Receives messages from the network the node is connected to
 */
class Receiver {
    /**
     * Node that receives messages
     * @param {Sender} sender
     * @param {Node} node
     */
    constructor(sender, node) {
        this.sender = sender;
        this.node = node;

        this.initDefaultListeners();
        this.initCustomListeners();
    }

    /**
     * Initialize default listeners that listen to network messages
    */
    initDefaultListeners() {
        this.node.on('connect', () => {
            if (process.env.IS_BACKUP !== 'true') {
                this.sender.registeToNetwork();
            }
            console.log('Welcome %s!\nYou just made your first connection with the frozen network! :)', this.node.id);
        });

        this.node.on('disconnect', () => {
            console.log('You just lost all your connections with the frozen network! :(\nGoodbye %s!', this.node.id);
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
        process.stdin.pipe(this.node.broadcast).on('data', (chunk) => {
            const message = JSON.parse(chunk.toString('utf8'));
            if (message.action === 'knockknock') {
                // A new node has knocked on the doors of the frozen network.
                // The backup-validator opens and introduces him to the other nodes.
                this.sender.introduceNewNode(message.node_host, message.node_port);
            } else if (message.action === 'nice_to_meet_you') {
                // The new node has introduced himself.
                // You like this node and add him to your connections.
                this.node.addPeer(message.node_host, message.node_port);
            }
        });
    }
}

module.exports = Receiver;
