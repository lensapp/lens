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

import { EndpointSubset } from "../endpoints";

describe("endpoint tests", () => {
  describe("EndpointSubset", () => {
    it.each([
      4,
      false,
      null,
      {},
      [],
      "ahe",
      /a/,
    ])("should always initialize fields when given %j", (data: any) => {
      const sub = new EndpointSubset(data);

      expect(sub.addresses).toStrictEqual([]);
      expect(sub.notReadyAddresses).toStrictEqual([]);
      expect(sub.ports).toStrictEqual([]);
    });

    it("toString should be addresses X ports", () => {
      const sub = new EndpointSubset({
        addresses: [{
          ip: "1.1.1.1",
        }, {
          ip: "1.1.1.2",
        }] as any,
        notReadyAddresses: [],
        ports: [{
          port: "81",
        }, {
          port: "82",
        }] as any,
      });

      expect(sub.toString()).toBe("1.1.1.1:81, 1.1.1.1:82, 1.1.1.2:81, 1.1.1.2:82");
    });
  });
});
