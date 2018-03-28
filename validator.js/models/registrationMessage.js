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
        super();
        this.action = 'register';
        this.node = node;
    }
}

module.exports = RegistrationMessage;
