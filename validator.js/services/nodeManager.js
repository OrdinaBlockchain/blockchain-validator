const smoke = require('smokesignal');
const randomName = require('node-random-name');

/** */
class NodeManager {
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
                port: parseInt(process.env.PORT),
                address: smoke.localIp(process.env.HOST),
                seeds: [
                    {port: parseInt(process.env.BACKUP_2_PORT), address: process.env.BACKUP_2_HOST},
                ],
                minPeerNo: 1,
                maxPeerNo: 9999999,
            });
            node.id = 'backup/' + randomName();
        } else {
            node = smoke.createNode({
                port: parseInt(process.env.PORT),
                address: smoke.localIp(process.env.HOST),
                seeds: [
                    {port: parseInt(process.env.BACKUP_1_PORT), address: process.env.BACKUP_1_HOST},
                    {port: parseInt(process.env.BACKUP_2_PORT), address: process.env.BACKUP_2_HOST},
                ],
                minPeerNo: 1,
                maxPeerNo: 4,
            });
            node.id = randomName();
        }
        return node;
    }
}

module.exports = NodeManager;
