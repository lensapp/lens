/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Encode/decode utf-8 base64 string
import * as Base64 from "crypto-js/enc-base64";
import * as Utf8 from "crypto-js/enc-utf8";

/**
 * Computes utf-8 from base64
 * @param data A Base64 encoded string
 * @returns The original utf-8 string
 */
function decode(data: string): string {
  return Base64.parse(data).toString(Utf8);
}

/**
 * Computes base64 from utf-8
 * @param data A normal string
 * @returns A base64 encoded version
 */
function encode(data: string): string {
  return Utf8.parse(data).toString(Base64);
}

export const base64 = {
  encode,
  decode,
};
