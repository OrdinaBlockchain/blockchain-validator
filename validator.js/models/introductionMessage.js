const Message = require('./message.js');

/**
 *
 */
class IntroductionMessage extends Message {
    /**
     *
     * @param {*} node
     */
    constructor(node) {
        super('nice_to_meet_you', node.options.address, node.options.port);
        this.node_id = node.id;
        this.node_host = node.options.address;
        this.node_port = node.options.port;
    }
}

module.exports = IntroductionMessage;
