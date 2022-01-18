/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { nextUpdateChannel } from "../update-channel";

describe("nextUpdateChannel", () => {
  it("returns latest if current channel is latest", () => {
    expect(nextUpdateChannel("latest", "latest")).toEqual("latest");
  });

  it("returns beta if current channel is alpha", () => {
    expect(nextUpdateChannel("alpha", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("beta", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("rc", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("latest", "alpha")).toEqual("beta");
  });

  it("returns latest if current channel is beta", () => {
    expect(nextUpdateChannel("alpha", "beta")).toEqual("latest");
    expect(nextUpdateChannel("beta", "beta")).toEqual("latest");
    expect(nextUpdateChannel("rc", "beta")).toEqual("latest");
    expect(nextUpdateChannel("latest", "beta")).toEqual("latest");
  });

  it("returns default if current channel is unknown", () => {
    expect(nextUpdateChannel("alpha", "rc")).toEqual("alpha");
    expect(nextUpdateChannel("beta", "rc")).toEqual("beta");
    expect(nextUpdateChannel("rc", "rc")).toEqual("rc");
    expect(nextUpdateChannel("latest", "rc")).toEqual("latest");
  });
});
