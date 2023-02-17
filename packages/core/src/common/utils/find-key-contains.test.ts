/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import type { FindKeyContains } from "./find-key-contains.injectable";
import findKeyContainsInjectable from "./find-key-contains.injectable";

describe("find-key-contains", () => {
  let map: Map<string, string>;

  let findKeyContains: FindKeyContains;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    findKeyContains = di.inject(findKeyContainsInjectable);
  });

  describe("map with entries", () => {
    beforeEach(() => {
      map = new Map();
      map.set("some-key", "some-value");
    });

    it("given key starts with key, returns value", () => {
      expect(findKeyContains(map, "some")).toEqual("some-value");
    });

    it("given key ends with key, returns value", () => {
      expect(findKeyContains(map, "key")).toEqual("some-value");
    });

    it("given key is in middle of key, returns value", () => {
      map.set("some-long-key", "some-value-for-long-key");

      expect(findKeyContains(map, "long")).toEqual("some-value-for-long-key");
    });

    it("given key does not include text, returns undefined", () => {
      expect(findKeyContains(map, "not")).toEqual(undefined);
    });
  });

  describe("map with no entries", () => {
    it("it returns undefined", () => {
      expect(findKeyContains(map, "some-text")).toEqual(undefined);
    });
  });
});
