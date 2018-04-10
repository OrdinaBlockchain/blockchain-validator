const uuid = require('uuid');

/**
 * Default message
 */

class Message {

    /**
     *
     * @param {*} node
     * @param {*} action
     * @param {*} body
     */
    constructor(node, action, body) {
        this.id = uuid();
        this.timestamp = new Date;
        this.source = {
            id: node.id,
            host: node.options.address,
            port: node.options.port,
        };
        this.action = action;
        this.body = body;
        this.recipients = [];
    }

    /**
     *
     * @param {Node} nodeId
     */
    addRecipient(nodeId) {
        if (this.recipients.indexOf(nodeId) === -1) {
            this.recipients.push(nodeId);
        }
    }
}

module.exports = Message;