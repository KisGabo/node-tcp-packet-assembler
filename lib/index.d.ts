import { EventEmitter } from 'events';
import { Socket } from 'net';

export class SocketPacketAssembler extends EventEmitter {

  public readonly origSocket: Socket;
  private bytesToRead: number;
  private eventName: string;
  private buffer: Buffer;

  public constructor(socket: Socket);
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
