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
        this.node = node;
    }
}

module.exports = RegistrationMessage;
