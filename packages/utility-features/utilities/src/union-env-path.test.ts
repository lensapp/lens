/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { unionPATHs } from "../union-env-path";

describe("unionPATHs", () => {
  it("return the same path if given only one with no double delimiters", () => {
    expect(unionPATHs(`/bin/bar${path.delimiter}/usr/bin`)).toBe(`/bin/bar${path.delimiter}/usr/bin`);
  });

  it("return equivalent path if given only one with no double delimiters", () => {
    expect(unionPATHs(`/bin/bar${path.delimiter}${path.delimiter}/usr/bin`)).toBe(`/bin/bar${path.delimiter}/usr/bin`);
  });

  it("should remove duplicate entries, appending non duplicates in order received", () => {
    expect(unionPATHs(
      `/bin/bar${path.delimiter}/usr/bin`,
      `/bin/bar${path.delimiter}/usr/lens/bat`,
    )).toBe(`/bin/bar${path.delimiter}/usr/bin${path.delimiter}/usr/lens/bat`);
  });

  it("should remove duplicate entries, appending non duplicates in order received, 3", () => {
    expect(unionPATHs(
      `/bin/bar${path.delimiter}/usr/bin`,
      `/bin/bar${path.delimiter}/usr/lens/bat`,
      `/usr/local/lens${path.delimiter}/usr/bin`,
    )).toBe(`/bin/bar${path.delimiter}/usr/bin${path.delimiter}/usr/lens/bat${path.delimiter}/usr/local/lens`);
  });
});
