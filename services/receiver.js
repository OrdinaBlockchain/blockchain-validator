const Blockchain = require('../modules/Blockchain');

/** */
class Receiver {
    /**
     * Node that receives messages
     * @param {Sender} sender
     * @param {Node} node
     * @param {Messager} messager
     */
    constructor(sender, node, messager) {
        this.sender = sender;
        this.node = node;
        this.messager = messager;
        this.peers = [];

        this.initDefaultListeners();
        this.initCustomListeners();
    }

    /**
     * Initialize default listeners that listen to network messages
    */
    initDefaultListeners() {
        this.node.on('connect', () => {
            this.messager.notify('node-connected');
            this.messager.log('Welcome ' + this.node.id + 'to the frozen network! :)');
            if (process.env.IS_BACKUP !== 'true') {
                this.sender.requestPeers();
            }
        });

        this.node.on('disconnect', () => {
            this.messager.notify('node-disconnected');
            this.messager.log('Goodbye ' + this.node.id + ' :(');
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
                this.messager.log(message.source.id + ' requests peerlist');
                this.onPeerRequest(message.data);
            } else if (message.context === 'reply_peers' && message.recipients.indexOf(this.node.id) !== -1) {
                this.messager.log(message.source.id + ' has given a peerlist');
                this.onPeerReply(message.data);
            } else if (message.context === 'new_transaction') {
                this.messager.log(message.source.id + ' has given you a new transaction');
                this.onNewTransaction(message.data);
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

    /**
     *
     * @param {*} data
     */
    onNewTransaction(data) {
        new Blockchain('empty', 'empty').addTransaction(data.transactionData);
    }
}

module.exports = Receiver;
