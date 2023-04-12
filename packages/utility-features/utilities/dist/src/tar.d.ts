/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/// <reference types="node" />
import type { JsonValue } from "type-fest";
export type ReadFileFromTarOpts<ParseJson extends boolean> = {
    tarPath: string;
    filePath: string;
} & (ParseJson extends true ? {
    parseJson: true;
} : {
    parseJson?: false;
});
export declare function readFileFromTar(opts: ReadFileFromTarOpts<false>): Promise<Buffer>;
export declare function readFileFromTar(opts: ReadFileFromTarOpts<true>): Promise<JsonValue>;
export declare function listTarEntries(filePath: string): Promise<string[]>;
