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

import { KubeObject } from "../kube-object";

describe("KubeObject", () => {
  describe("isJsonApiData", () => {
    {
      type TestCase = [any];
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
        expect(KubeObject.isJsonApiData(input)).toBe(false);
      });
    }

    {
      type TestCase = [string, any];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", apiVersion: "" }],
        ["metadata.uid", { kind: "", apiVersion: "", metadata: { name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata.name", { kind: "", apiVersion: "", metadata: { uid: "", resourceVersion: "", selfLink: "" }}],
        ["metadata.resourceVersion", { kind: "", apiVersion: "", metadata: { uid: "", name: "", selfLink: "" }}],
      ];

      it.each(tests)("should reject with missing: %s", (missingField, input) => {
        expect(KubeObject.isJsonApiData(input)).toBe(false);
      });
    }

    {
      type TestCase = [string, any];
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
        expect(KubeObject.isJsonApiData(input)).toBe(false);
      });
    }

    it("should accept valid KubeJsonApiData (ignoring other fields)", () => {
      const valid = { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: "" }}};

      expect(KubeObject.isJsonApiData(valid)).toBe(true);
    });
  });

  describe("isPartialJsonApiData", () => {
    {
      type TestCase = [any];
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
        expect(KubeObject.isPartialJsonApiData(input)).toBe(false);
      });
    }

    it("should accept {}", () => {
      expect(KubeObject.isPartialJsonApiData({})).toBe(true);
    });

    {
      type TestCase = [string, any];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", apiVersion: "" }],
      ];

      it.each(tests)("should not reject with missing top level field: %s", (missingField, input) => {
        expect(KubeObject.isPartialJsonApiData(input)).toBe(true);
      });
    }

    {
      type TestCase = [string, any];
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
        expect(KubeObject.isPartialJsonApiData(input)).toBe(false);
      });
    }

    it("should accept valid Partial<KubeJsonApiData> (ignoring other fields)", () => {
      const valid = { kind: "", apiVersion: "", metadata: { uid: "", name: "", resourceVersion: "", selfLink: "", annotations: { food: "" }}};

      expect(KubeObject.isPartialJsonApiData(valid)).toBe(true);
    });
  });

  describe("isJsonApiDataList", () => {
    function isAny(val: unknown): val is any {
      return true;
    }

    function isNotAny(val: unknown): val is any {
      return false;
    }

    function isBoolean(val: unknown): val is boolean {
      return typeof val === "boolean";
    }

    {
      type TestCase = [any];
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
        expect(KubeObject.isJsonApiDataList(input, isAny)).toBe(false);
      });
    }

    {
      type TestCase = [string, any];
      const tests: TestCase[] = [
        ["kind", { apiVersion: "", items: [], metadata: { resourceVersion: "", selfLink: "" }}],
        ["apiVersion", { kind: "", items: [], metadata: { resourceVersion: "", selfLink: "" }}],
        ["metadata", { kind: "", items: [], apiVersion: "" }],
      ];

      it.each(tests)("should reject with missing: %s", (missingField, input) => {
        expect(KubeObject.isJsonApiDataList(input, isAny)).toBe(false);
      });
    }

    {
      type TestCase = [string, any];
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
        expect(KubeObject.isJsonApiDataList(input, isNotAny)).toBe(false);
      });
    }

    it("should accept valid KubeJsonApiDataList (ignoring other fields)", () => {
      const valid = { kind: "", items: [false], apiVersion: "", metadata: { resourceVersion: "", selfLink: "" }};

      expect(KubeObject.isJsonApiDataList(valid, isBoolean)).toBe(true);
    });
  });
});
