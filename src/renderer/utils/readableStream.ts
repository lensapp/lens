import { Readable } from "readable-stream";

/**
 * ReadableWebToNodeStream
 *
 * Copied from https://github.com/Borewit/readable-web-to-node-stream
 *
 * Adds read error handler
 *
 * */
export class ReadableWebToNodeStream extends Readable {

  public bytesRead = 0;
  public released = false;

  /**
   * Default web API stream reader
   * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
   */
  private reader: ReadableStreamReader;
  private pendingRead: Promise<any>;

  /**
   *
   * @param stream Readable​Stream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
   */
  constructor(stream: ReadableStream) {
    super();
    this.reader = stream.getReader();
  }

  /**
   * Implementation of readable._read(size).
   * When readable._read() is called, if data is available from the resource,
   * the implementation should begin pushing that data into the read queue
   * https://nodejs.org/api/stream.html#stream_readable_read_size_1
   */
  public async _read() {
    // Should start pushing data into the queue
    // Read data from the underlying Web-API-readable-stream
    if (this.released) {
      this.push(null); // Signal EOF

      return;
    }

    try {
      this.pendingRead = this.reader.read();
      const data = await this.pendingRead;

      // clear the promise before pushing pushing new data to the queue and allow sequential calls to _read()
      delete this.pendingRead;

      if (data.done || this.released) {
        this.push(null); // Signal EOF
      } else {
        this.bytesRead += data.value.length;
        this.push(data.value); // Push new data to the queue
      }
    } catch(error) {
      this.push(null); // Signal EOF
    }
  }

  /**
   * If there is no unresolved read call to Web-API Readable​Stream immediately returns;
   * otherwise will wait until the read is resolved.
   */
  public async waitForReadToComplete() {
    if (this.pendingRead) {
      await this.pendingRead;
    }
  }

  /**
   * Close wrapper
   */
  public async close(): Promise<void> {
    await this.syncAndRelease();
  }

  private async syncAndRelease() {
    this.released = true;
    await this.waitForReadToComplete();
    await this.reader.releaseLock();
  }
}
