const uuid = require('uuid');

/**
 * Default message
*/
class Message {
    /**
     *
     * @param {string} action
     */
    constructor(action) {
        this.id = uuid();
        this.timestamp = new Date;
        this.action = action;
    }
}

module.exports = Message;
