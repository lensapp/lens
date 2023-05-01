/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isJsonApiData, isJsonApiDataList, isPartialJsonApiData } from "@k8slens/kube-object";

describe("KubeObject", () => {
  describe("isJsonApiData", () => {
    {
      type TestCase = [unknown];
      const tests: TestCase[] = [
        [false],
        [true],
        [null],
        [undefined],
        [""],
        [1],
        [(): unknown => void 0],
        [Symbol("hello")],
        [{}],
      ];

      it.each(tests)("should reject invalid value: %p", (input) => {
        expect(isJsonApiData(input)).toBe(false);
      });
    }

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", apiVersion: "" }],
        ["metadata.uid", { kind: "", apiVersion: "", metadata: { name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata.name", { kind: "", apiVersion: "", metadata: { uid: "", resourceVersion: "", selfLink: "" }}],
        ["metadata.resourceVersion", { kind: "", apiVersion: "", metadata: { uid: "", name: "", selfLink: "" }}],
      ];

      it.each(tests)("should reject with missing: %s", (missingField, input) => {
        expect(isJsonApiData(input)).toBe(false);
      });
    }

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { kind: 1, apiVersion: "", metadata: {}}],
        ["apiVersion", { apiVersion: 1, kind: "", metadata: {}}],
        ["metadata", { kind: "", apiVersion: "", metadata: "" }],
        ["metadata.uid", { kind: "", apiVersion: "", metadata: { uid: 1 }}],
        ["metadata.name", { kind: "", apiVersion: "", metadata: { uid: "", name: 1 }}],
        ["metadata.resourceVersion", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: 1 }}],
        ["metadata.selfLink", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: 1 }}],
        ["metadata.namespace", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", namespace: 1 }}],
        ["metadata.creationTimestamp", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", creationTimestamp: 1 }}],
        ["metadata.continue", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", continue: 1 }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: 1 }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: [1] }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: {}}}],
        ["metadata.labels", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", labels: 1 }}],
        ["metadata.labels", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", labels: { food: 1 }}}],
        ["metadata.annotations", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: 1 }}],
        ["metadata.annotations", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: 1 }}}],
      ];

      it.each(tests)("should reject with wrong type for field: %s", (missingField, input) => {
        expect(isJsonApiData(input)).toBe(false);
      });
    }

    it("should accept valid KubeJsonApiData (ignoring other fields)", () => {
      const valid = { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: "" }}};

      expect(isJsonApiData(valid)).toBe(true);
    });
  });

  describe("isPartialJsonApiData", () => {
    {
      type TestCase = [unknown];
      const tests: TestCase[] = [
        [false],
        [true],
        [null],
        [undefined],
        [""],
        [1],
        [(): unknown => void 0],
        [Symbol("hello")],
      ];

      it.each(tests)("should reject invalid value: %p", (input) => {
        expect(isPartialJsonApiData(input)).toBe(false);
      });
    }

    it("should accept {}", () => {
      expect(isPartialJsonApiData({})).toBe(true);
    });

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", apiVersion: "" }],
      ];

      it.each(tests)("should not reject with missing top level field: %s", (missingField, input) => {
        expect(isPartialJsonApiData(input)).toBe(true);
      });
    }

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { kind: 1, apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { apiVersion: 1, kind: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", apiVersion: "", metadata: "" }],
        ["metadata.uid", { kind: "", apiVersion: "", metadata: { uid: 1, name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata.name", { kind: "", apiVersion: "", metadata: { uid: "", name: 1, resourceVersion: "", selfLink: "" }}],
        ["metadata.resourceVersion", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: 1, selfLink: "" }}],
        ["metadata.selfLink", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: 1 }}],
        ["metadata.namespace", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", namespace: 1 }}],
        ["metadata.creationTimestamp", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", creationTimestamp: 1 }}],
        ["metadata.continue", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", continue: 1 }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: 1 }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: [1] }}],
        ["metadata.finalizers", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", finalizers: {}}}],
        ["metadata.labels", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", labels: 1 }}],
        ["metadata.labels", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", labels: { food: 1 }}}],
        ["metadata.annotations", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: 1 }}],
        ["metadata.annotations", { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: 1 }}}],
      ];

      it.each(tests)("should reject with wrong type for field: %s", (missingField, input) => {
        expect(isPartialJsonApiData(input)).toBe(false);
      });
    }

    it("should accept valid Partial<KubeJsonApiData> (ignoring other fields)", () => {
      const valid = { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: "" }}};

      expect(isPartialJsonApiData(valid)).toBe(true);
    });
  });

  describe("isJsonApiDataList", () => {
    function isSomething(val: unknown): val is unknown {
      return true;
    }

    function isNotSomething(val: unknown): val is unknown {
      return false;
    }

    function isBoolean(val: unknown): val is boolean {
      return typeof val === "boolean";
    }

    {
      type TestCase = [unknown];
      const tests: TestCase[] = [
        [false],
        [true],
        [null],
        [undefined],
        [""],
        [1],
        [(): unknown => void 0],
        [Symbol("hello")],
        [{}],
      ];

      it.each(tests)("should reject invalid value: %p", (input) => {
        expect(isJsonApiDataList(input, isSomething)).toBe(false);
      });
    }

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", items: [], metadata: { resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", items: [], metadata: { resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", items: [], apiVersion: "" }],
      ];

      it.each(tests)("should reject with missing: %s", (missingField, input) => {
        expect(isJsonApiDataList(input, isSomething)).toBe(false);
      });
    }

    {
      type TestCase = [string, unknown];
      const tests: TestCase[] = [
        ["kind", { kind: 1, items: [], apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", items: [], apiVersion: 1, metadata: { resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", items: [], apiVersion: "", metadata: 1 }],
        ["metadata.resourceVersion", { kind: "", items: [], apiVersion: "", metadata: { resourceVersion: 1, selfLink: "" }}],
        ["metadata.selfLink", { kind: "", items: [], apiVersion: "", metadata: { resourceVersion: "", selfLink: 1 }}],
        ["items", { kind: "", items: 1, apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }}],
        ["items", { kind: "", items: "", apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }}],
        ["items", { kind: "", items: {}, apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }}],
        ["items[0]", { kind: "", items: [""], apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }}],
      ];

      it.each(tests)("should reject with wrong type for field: %s", (missingField, input) => {
        expect(isJsonApiDataList(input, isNotSomething)).toBe(false);
      });
    }

    it("should accept valid KubeJsonApiDataList (ignoring other fields)", () => {
      const valid = { kind: "", items: [false], apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }};

      expect(isJsonApiDataList(valid, isBoolean)).toBe(true);
    });
  });
});
