const Message = require('./message.js');

/**
 *
 */
class RegistrationMessage extends Message {
    /**
     *
     * @param {Node} node
     */
    constructor(node) {
        super('knockknock', node.options.address, node.options.port);
        this.node_host = node.options.address;
        this.node_port = node.options.port;
    }
}

module.exports = RegistrationMessage;
