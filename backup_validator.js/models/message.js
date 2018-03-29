const uuid = require('uuid');

/**
 * Default message
*/
class Message {
    /** */
    constructor() {
        this.id = uuid();
        this.timestamp = new Date;
    }
}

module.exports = Message;
