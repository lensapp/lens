/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Readable } from "readable-stream";
import type { TypedArray } from "type-fest";

/**
 * ReadableWebToNodeStream
 *
 * Copied from https://github.com/Borewit/readable-web-to-node-stream
 *
 * Adds read error handler
 *
 * */
export class ReadableWebToNodeStream<T extends TypedArray> extends Readable {

  public bytesRead = 0;
  public released = false;

  /**
   * Default web API stream reader
   * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
   */
  private reader: ReadableStreamReader<T>;
  private pendingRead: Promise<ReadableStreamDefaultReadResult<T>>;

  /**
   *
   * @param stream ReadableStream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
   */
  constructor(stream: ReadableStream<T>) {
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
    } catch (error) {
      this.push(null); // Signal EOF
    }
  }

  /**
   * If there is no unresolved read call to Web-API ReadableStream immediately returns;
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
