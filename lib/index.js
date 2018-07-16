const net = require('net');
const events = require('events');

/**
 * Utility to read definite number of bytes from a socket.
 */
class SocketPacketAssembler extends events.EventEmitter {

  /**
   * Initialize an assembler on given socket
   * by subscribing to socket's "data" event.
   *
   * @param {module:net.Socket} socket
   */
  constructor(socket) {
    super();

    if (!(socket instanceof net.Socket)) {
      throw new TypeError('Parameter must be a socket');
    }

    /**
     * The original Socket object wrapped.
     *
     * @type {module:net.Socket}
     * @readonly
     */
    this.origSocket = socket;

    /**
     * Number of bytes to emit at once.
     *
     * @type {?number}
     * @private
     */
    this.bytesToRead = null;

    /**
     * Next event's name.
     *
     * @type {?string}
     * @private
     */
    this.eventName = null;

    /**
     * Received data which has not been emitted yet.
     *
     * @type {?Buffer}
     * @private
     */
    this.buffer = null;

    this.origSocket.on('data', data => {
      this.bufferData(data);
      this.emitIfNecessary();
    });
  }

  /**
   * Set the number of bytes to expect on stream.
   *
   * @param {number} bytesToRead
   * @param {string} [identifier=data] - Name of event emitted when bytes arrived.
   */
  readBytes(bytesToRead, identifier) {
    if (this.bytesToRead !== null) {
      throw new Error('Can\'t alter the number of bytes to read before receiving the requested data');
    }

    if (typeof bytesToRead !== 'number') {
      throw new TypeError('bytesToRead must be a number');
    }

    if (bytesToRead <= 0 || isNaN(bytesToRead)) {
      throw new RangeError('bytesToRead must be a positive integer');
    }

    this.bytesToRead = bytesToRead;

    this.eventName = typeof identifier === 'string' && identifier !== ''
        ? identifier
        : 'data';

    // Check if there's something to emit immediately.
    // Using setImmediate() here to not block by executing event handlers.
    // This is also for preventing too much recursion in case
    // the handler calls another readBytes().
    setImmediate(this.emitIfNecessary.bind(this));
  }

  /**
   * Slice internal buffer and emit the requested chunk if necessary.
   *
   * @private
   */
  emitIfNecessary() {
    if (this.buffer === null || this.bytesToRead === null) {
      // Nothing in buffer or nothing to read
      return;
    }

    let bufToEmit;

    if (this.buffer.length > this.bytesToRead) {
      // More data than required, so cut off the requested chunk and return that
      bufToEmit = this.buffer.slice(0, this.bytesToRead);
      this.buffer = this.buffer.slice(this.bytesToRead);
    } else if (this.buffer.length === this.bytesToRead) {
      // Exactly as many bytes in buffer as to read, so emit the whole buffer
      bufToEmit = this.buffer;
      this.buffer = null;
    } else {
      // Not enough bytes in buffer
      return;
    }

    this.bytesToRead = null;

    /**
     * The requested number of bytes arrived.
     *
     * @event SocketPacketAssembler#data
     * @type Buffer
     */
    this.emit(this.eventName, bufToEmit);
  }

  /**
   * Add data to internal buffer.
   *
   * @param {Buffer} data
   * @private
   */
  bufferData(data) {
    if (this.buffer === null) {
      this.buffer = data;
    } else {
      this.buffer = Buffer.concat([this.buffer, data]);
    }
  }

}

module.exports = SocketPacketAssembler;
