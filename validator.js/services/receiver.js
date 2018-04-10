const Transaction = require('../modules/transaction');

/** */
class Receiver {
    /**
     * Node that receives messages
     * @param {Sender} sender
     * @param {Node} node
     */
    constructor(sender, node) {
        this.sender = sender;
        this.node = node;
        this.peers = [];

        this.initDefaultListeners();
        this.initCustomListeners();
    }

    /**
     * Initialize default listeners that listen to network messages
    */
    initDefaultListeners() {
        console.log('Welcome %s!\nYou just made your first connection with the frozen network! :)', this.node.id);

        this.node.on('connect', () => {
            if (process.env.IS_BACKUP !== 'true') {
                this.sender.requestPeers();
            }
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

            if (message.context === 'request_peers' && process.env.IS_BACKUP === 'true') {
                console.log('%s requests peerlist', message.source.id);
                this.onPeerRequest(message.data);
            } else if (message.context === 'reply_peers' && message.recipients.indexOf(this.node.id) !== -1) {
                console.log('%s has given a peerlist', message.source.id);
                this.onPeerReply(message.data);
            } else if (message.context === 'new_transaction') {
                console.log('%s has given you a new transaction', message.source.id);
                const transaction = new Transaction(message.data.transactionData);
                if (transaction.verify()) {
                    console.log('Succesfully verified signature!');
                } else {
                    console.log('Signature invalid!');
                }
            }
        });
    }

    /**
     *
     * @param {*} data
     */
    onPeerRequest(data) {
        let peers = [];
        this.node.peers.list.forEach((peer) => {
            peers.push({
                host: peer.socket.host,
                port: peer.socket.port,
            });
        });
        this.sender.sendPeers(peers, data.recipientId);
    }

    /**
     *
     * @param {*} data
     */
    onPeerReply(data) {
        // To Do (optional)
        this.peers = data.peers;
    }
}

module.exports = Receiver;
