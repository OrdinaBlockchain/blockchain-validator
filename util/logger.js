/** */
class Logger {
    /**
     *
     * @param {*} socket
     */
    constructor(socket) {
        this.socket = socket;
    }

    /**
     *
     * @param {*} message
     */
    log(message) {

    }

    /**
     *
     * @param {*} event
     * @param {*} message
     */
    notify(event, message) {
        this.socket.emit(event, message);
    }
}

module.exports = Logger;
