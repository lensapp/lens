/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
export declare class ReadableWebToNodeStream<T extends TypedArray> extends Readable {
    bytesRead: number;
    released: boolean;
    /**
     * Default web API stream reader
     * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
     */
    private reader;
    private pendingRead?;
    /**
     *
     * @param stream ReadableStream: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
     */
    constructor(stream: ReadableStream<T>);
    /**
     * Implementation of readable._read(size).
     * When readable._read() is called, if data is available from the resource,
     * the implementation should begin pushing that data into the read queue
     * https://nodejs.org/api/stream.html#stream_readable_read_size_1
     */
    _read(): Promise<void>;
    /**
     * If there is no unresolved read call to Web-API ReadableStream immediately returns;
     * otherwise will wait until the read is resolved.
     */
    waitForReadToComplete(): Promise<void>;
    /**
     * Close wrapper
     */
    close(): Promise<void>;
    private syncAndRelease;
}
