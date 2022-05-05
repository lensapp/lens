/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isLongRunningRequest } from "../lens-proxy/lens-proxy";

describe("isLongRunningRequest", () => {
  it("returns true on watches", () => {
    ["watch=true", "watch=1", "watch"].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods?${param}`),
      ).toBeTruthy();
    });
  });

  it("returns false on disabled watches", () => {
    ["watch=false", "watch=0", ""].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods?${param}`),
      ).toBeFalsy();
    });
  });

  it("returns true on follows", () => {
    ["follow=true", "follow=1", "follow"].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods/foo/log?${param}`),
      ).toBeTruthy();
    });
  });

  it("returns false on disabled follows", () => {
    ["follow=false", "follow=0", ""].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods/foo/log?${param}`),
      ).toBeFalsy();
    });
  });
});
