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
        super('register');
        this.node_id = node.id;
        this.node_host = node.options.address;
        this.node_port = node.options.port;
    }
}

module.exports = RegistrationMessage;
