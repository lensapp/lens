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

import { isMac, isWindows } from "./vars";
// @ts-expect-error winca/api module doesn't have a type definition
import wincaAPI from "win-ca/api";
import https from "https";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Get root CA certificate from MacOSX system keychain
 */
export const getMacRootCA = async () => {
  // inspired mac-ca https://github.com/jfromaniello/mac-ca
  const args = "find-certificate -a -p";
  const splitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;
  const systemRootCertsPath = "/System/Library/Keychains/SystemRootCertificates.keychain";
  const bin = "/usr/bin/security";
  const trusted = (await execAsync(`${bin} ${args}`)).stdout.toString().split(splitPattern);
  const rootCA = (await execAsync(`${bin} ${args} ${systemRootCertsPath}`)).stdout.toString().split(splitPattern);

  return [...new Set([...trusted, ...rootCA])];
};

/**
 * Get root CA certificate from Windows system certificate store
 */
export const getWinRootCA = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const CAs: string[] = [];

    wincaAPI({
      format: wincaAPI.der2.pem,
      inject: false,
      ondata: (ca: string) => {
        CAs.push(ca);
      },
      onend: () => {
        resolve(CAs);
      }
    });
  });
};

/**
 * Add (or merge) CAs to https.globalAgent.options.ca
 */
export const injectCAs = async (CAs: Array<string>) => {
  for (const cert of CAs) {
    if (Array.isArray(https.globalAgent.options.ca)) {
      !https.globalAgent.options.ca.includes(cert) && https.globalAgent.options.ca.push(cert);
    } else {
      https.globalAgent.options.ca = [cert];
    }
  }
};

if (isMac) {
  getMacRootCA().then((osxRootCAs) => {
    injectCAs(osxRootCAs);
  }).catch((error) => {
    console.warn(`[MAC-CA]: Error injecting root CAs from MacOSX. ${error?.message}`);
  });
}

if (isWindows) {
  getWinRootCA().then((winRootCAs) => {
    wincaAPI.inject("+", winRootCAs);
  }).catch((error) => {
    console.warn(`[WIN-CA]: Error injecting root CAs from Windows. ${error?.message}`);
  });
}
