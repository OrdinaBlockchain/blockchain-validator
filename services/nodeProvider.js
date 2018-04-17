const smoke = require('smokesignal');
const randomName = require('node-random-name');
const PORT = 9177;

/** */
class NodeProvider {
    /** */
    constructor() { }

    /**
     *
     * @return {Node} node
     */
    createNode() {
        let node;
        if (process.env.IS_BACKUP === 'true') {
            node = smoke.createNode({
                port: PORT,
                address: smoke.localIp(process.env.NODE_HOST),
                seeds: [
                    {port: PORT, address: process.env.BACKUP_2_HOST},
                ],
                minPeerNo: 1,
                maxPeerNo: 9999999,
            });
            node.id = 'backup/' + randomName();
        } else {
            node = smoke.createNode({
                port: PORT,
                address: smoke.localIp(process.env.NODE_HOST),
                seeds: [
                    {port: PORT, address: process.env.BACKUP_1_HOST},
                    {port: PORT, address: process.env.BACKUP_2_HOST},
                ],
                minPeerNo: 1,
                maxPeerNo: 4,
            });
            node.id = randomName();
        }
        return node;
    }
}

module.exports = NodeProvider;
