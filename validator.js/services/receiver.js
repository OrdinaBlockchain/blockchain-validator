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
                this.sender.requestDefaultPeerList();
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
            if (message.action === 'request_default_peerlist') {
                if (process.env.IS_BACKUP === 'true') {
                    console.log('%s: %s (%s:%s) requests default peerlist', message.timestamp, message.source.id, message.source.host, message.source.port);

                    let peers = [];
                    this.node.peers.list.forEach((peer) => {
                        peers.push({
                            host: peer.node.options.address,
                            port: peer.node.options.port,
                        });
                    });
                    this.sender.sendDefaultPeerList(peers, message.source.id);
                }
            } else if (message.action === 'retreived_default_peerlist') {
                if (message.recipients.indexOf(this.node.id) !== -1) {
                    console.log('%s: %s (%s:%s) has given a default peerlist', message.timestamp, message.source.id, message.source.host, message.source.port);

                    message.body.peers.forEach((host, port) => {
                        this.node.addPeer(host, port);
                    });
                    this.sender.introduceNodeToNetwork();
                }
            } else if (message.action === 'new_node') {
                let exists = false;
                this.node.peers.list.forEach((peer) => {
                    if (peer.node.id === message.source.id) {
                        exists = true;
                    }
                });
                if (!exists) {
                    this.node.addPeer(message.source.host, message.source.port);
                console.log('%s: Added %s (%s:%s) to your peerlist', message.timestamp, message.source.id, message.source.host, message.source.port);
                }
            }
        });
    }
}

module.exports = Receiver;
