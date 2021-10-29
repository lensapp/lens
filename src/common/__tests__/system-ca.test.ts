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
import https from "https";
import os from "os";
import { getMacRootCA, getWinRootCA, injectCAs } from "../system-ca";
import { dependencies, devDependencies } from "../../../package.json";

describe("inject CA for Mac", () => {
  // for reset https.globalAgent.options.ca after testing
  let _ca: string | Buffer | (string | Buffer)[];

  beforeEach(() => {
    _ca = https.globalAgent.options.ca;
  });

  afterEach(() => {
    https.globalAgent.options.ca = _ca;
  });

  const deps = { ...dependencies, ...devDependencies };

  // skip the test if mac-ca is not installed
  (deps["mac-ca"] && os.platform().includes("darwin") ? it: it.skip)("should inject the same ca as mac-ca", async () => {
    const osxCAs = await getMacRootCA();

    injectCAs(osxCAs);
    const injected = https.globalAgent.options.ca;

    await import("mac-ca");
    const injectedByMacCA = https.globalAgent.options.ca;

    // @ts-ignore
    expect(new Set(injected)).toEqual(new Set(injectedByMacCA));
  });
});

describe("inject CA for Windows", () => {
  // for reset https.globalAgent.options.ca after testing
  let _ca: string | Buffer | (string | Buffer)[];

  beforeEach(() => {
    _ca = https.globalAgent.options.ca;
  });

  afterEach(() => {
    https.globalAgent.options.ca = _ca;
  });

  const deps = { ...dependencies, ...devDependencies };

  // skip the test if win-ca is not installed
  (deps["win-ca"] && os.platform().includes("win32") ? it: it.skip)("should inject the same ca as winca.inject('+')", async () => {
    const winCAs = await getWinRootCA();

    // @ts-ignore
    const wincaAPI = await import("win-ca/api");

    wincaAPI.inject("+", winCAs);
    const injected = https.globalAgent.options.ca;

    const winca = await import("win-ca");

    winca.inject("+"); // see: https://github.com/ukoloff/win-ca#caveats
    const injectedByWinCA = https.globalAgent.options.ca;

    // @ts-ignore
    expect(new Set(injected)).toEqual(new Set(injectedByWinCA));
  });
});



