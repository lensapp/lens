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
import wincaAPI from "win-ca/api";
import https from "https";
import { promiseExecFile } from "./utils/promise-exec";
import logger from "./logger";

// DST Root CA X3, which was expired on 9.30.2021
export const DSTRootCAX3 = "-----BEGIN CERTIFICATE-----\nMIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/\nMSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\nDkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow\nPzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD\nEw5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\nAN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O\nrz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq\nOLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b\nxiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw\n7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD\naeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV\nHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG\nSIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69\nikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr\nAvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz\nR8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5\nJDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo\nOb8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ\n-----END CERTIFICATE-----\n";

export function isCertActive(cert: string) {
  const isExpired = typeof cert !== "string" || cert.includes(DSTRootCAX3);

  return !isExpired;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet#other_assertions
const certSplitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;

async function execSecurity(...args: string[]): Promise<string[]> {
  const { stdout } = await promiseExecFile("/usr/bin/security", args);

  return stdout.split(certSplitPattern);
}

/**
 * Get root CA certificate from MacOSX system keychain
 * Only return non-expred certificates.
 */
export async function getMacRootCA() {
  // inspired mac-ca https://github.com/jfromaniello/mac-ca
  const [trusted, rootCA] = await Promise.all([
    execSecurity("find-certificate", "-a", "-p"),
    execSecurity("find-certificate", "-a", "-p", "/System/Library/Keychains/SystemRootCertificates.keychain"),
  ]);

  return [...new Set([...trusted, ...rootCA])].filter(isCertActive);
}

/**
 * Get root CA certificate from Windows system certificate store.
 * Only return non-expred certificates.
 */
export function getWinRootCA(): Promise<string[]> {
  return new Promise((resolve) => {
    const CAs: string[] = [];

    wincaAPI({
      format: wincaAPI.der2.pem,
      inject: false,
      ondata: (ca: string) => {
        CAs.push(ca);
      },
      onend: () => {
        resolve(CAs.filter(isCertActive));
      },
    });
  });
}


/**
 * Add (or merge) CAs to https.globalAgent.options.ca
 */
export function injectCAs(CAs: string[]) {
  for (const cert of CAs) {
    if (Array.isArray(https.globalAgent.options.ca) && !https.globalAgent.options.ca.includes(cert)) {
      https.globalAgent.options.ca.push(cert);
    } else {
      https.globalAgent.options.ca = [cert];
    }
  }
}

/**
 * Inject CAs found in OS's (Windoes/MacOSX only) root certificate store to https.globalAgent.options.ca
 */
export async function injectSystemCAs() {
  if (isMac) {
    try {
      const osxRootCAs = await getMacRootCA();

      injectCAs(osxRootCAs);
    } catch (error) {
      logger.warn(`[MAC-CA]: Error injecting root CAs from MacOSX. ${error?.message}`);
    }
  }

  if (isWindows) {
    try {
      const winRootCAs = await getWinRootCA();

      wincaAPI.inject("+", winRootCAs);

    } catch (error) {
      logger.warn(`[WIN-CA]: Error injecting root CAs from Windows. ${error?.message}`);
    }
  }
}
