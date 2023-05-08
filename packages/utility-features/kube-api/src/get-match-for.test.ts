/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMatchFor } from "./get-match-for";

describe("get-match-for", () => {
  it("given non-matching and matching regex, when called with a string, returns match", () => {
    const getMatch = getMatchFor(/some-match/, /some-non-match/);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const match = [...getMatch("some-match")!];

    expect(match).toEqual(["some-match"]);
  });

  it("given multiple matching regex, when called with a string, returns first match", () => {
    const getMatch = getMatchFor(/match/, /some-match/);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const match = [...getMatch("match")!];

    expect(match).toEqual(["match"]);
  });

  it("given multiple matching regex with one non-matching, when called with a string, returns first match", () => {
    const getMatch = getMatchFor(/non-match/, /some-match/, /match/);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [...match] = getMatch("some-match")!;

    expect(match).toEqual(["some-match"]);
  });

  it("given no matching regex, when called with a string, returns undefined", () => {
    const getMatch = getMatchFor(/match/, /some-match/);

    const match = getMatch("some-other-string");

    expect(match).toBeUndefined();
  });
});
