/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/**
 * Computes utf-8 from base64
 * @param data A Base64 encoded string
 * @returns The original utf-8 string
 */
declare function decode(data: string): string;
/**
 * Computes base64 from utf-8
 * @param data A normal string
 * @returns A base64 encoded version
 */
declare function encode(data: string): string;
export declare const base64: {
    encode: typeof encode;
    decode: typeof decode;
};
export {};
