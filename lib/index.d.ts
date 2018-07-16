import { EventEmitter } from 'events';
import { Socket } from 'net';

/**
 * Utility to read definite number of bytes from a socket.
 */
declare class SocketPacketAssembler extends EventEmitter {

  /** The original Socket object wrapped. */
  public readonly origSocket: Socket;

  private bytesToRead: number;
  private eventName: string;
  private buffer: Buffer;

  /**
   * Initialize an assembler on given socket
   * by subscribing to socket's "data" event.
   *
   * @param socket
   */
  public constructor(socket: Socket);

  /**
   * Set the number of bytes to expect on stream.
   *
   * @param bytesToRead
   * @param [identifier=data] - Name of event emitted when bytes arrived.
   */
  public readBytes(bytesToRead: number, identifier: string = 'data'): void;

  private emitIfNecessary(): void;
  private bufferData(data: Buffer): void;

  public on(event: string, listener: (data: Buffer) => void): this;
  public once(event: string, listener: (data: Buffer) => void): this;
  public prependListener(event: string, listener: (data: Buffer) => void): this;
  public prependOnceListener(event: string, listener: (data: Buffer) => void): this;
  public removeListener(event: string, listener: (data: Buffer) => void): this;
  public off(event: string, listener: (data: Buffer) => void): this;

}

export = SocketPacketAssembler;
