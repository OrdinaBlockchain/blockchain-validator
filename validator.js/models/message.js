const uuid = require('uuid');

/**
 * Default message
*/
class Message {
    /**
     *
     * @param {*} action
     * @param {*} host
     * @param {*} port
     */
    constructor(action, host, port) {
        this.id = uuid();
        this.timestamp = new Date;
        this.source = host + ':' + port;
        this.action = action;
    }
}

module.exports = Message;
