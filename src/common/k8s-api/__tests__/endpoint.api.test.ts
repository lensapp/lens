/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
