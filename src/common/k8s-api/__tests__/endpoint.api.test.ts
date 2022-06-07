/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatEndpointSubset } from "../endpoints";

describe("endpoint tests", () => {
  describe("EndpointSubset", () => {
    it("formatEndpointSubset should be addresses X ports", () => {
      const formatted = formatEndpointSubset({
        addresses: [{
          ip: "1.1.1.1",
        }, {
          ip: "1.1.1.2",
        }],
        notReadyAddresses: [],
        ports: [{
          port: 81,
        }, {
          port: 82,
        }],
      });

      expect(formatted).toBe("1.1.1.1:81, 1.1.1.1:82, 1.1.1.2:81, 1.1.1.2:82");
    });
  });
});
