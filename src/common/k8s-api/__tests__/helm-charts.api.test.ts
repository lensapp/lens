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

import { anyObject } from "jest-mock-extended";
import logger from "../../logger";
import { HelmChart } from "../endpoints/helm-charts.api";

describe("HelmChart tests", () => {
  describe("HelmChart.create() tests", () => {
    it("should throw on non-object input", () => {
      expect(() => HelmChart.create("" as any)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(1 as any)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(false as any)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create([] as any)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(Symbol() as any)).toThrowError('"value" must be of type object');
    });

    it("should throw on missing fields", () => {
      expect(() => HelmChart.create({} as any)).toThrowError('"apiVersion" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
      } as any)).toThrowError('"name" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
      } as any)).toThrowError('"version" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
      } as any)).toThrowError('"repo" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
        repo: "!",
      } as any)).toThrowError('"created" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
        repo: "!",
        created: "!",
      } as any)).toThrowError('"digest" is required');
    });

    it("should throw on fields being wrong type", () => {
      expect(() => HelmChart.create({
        apiVersion: 1,
        name: "!",
        version: "!",
        repo: "!",
        created: "!",
        digest: "!",
      } as any)).toThrowError('"apiVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: 1,
        version: "!",
        repo: "!",
        created: "!",
        digest: "!",
      } as any)).toThrowError('"name" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "",
        version: 1,
        repo: "!",
        created: "!",
        digest: "!",
      } as any)).toThrowError('"version" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: 1,
        created: "!",
        digest: "!",
      } as any)).toThrowError('"repo" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        created: 1,
        digest: "a",
      } as any)).toThrowError('"created" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        created: "!",
        digest: 1,
      } as any)).toThrowError('"digest" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        kubeVersion: 1,
      } as any)).toThrowError('"kubeVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        description: 1,
      } as any)).toThrowError('"description" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        home: 1,
      } as any)).toThrowError('"home" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        engine: 1,
      } as any)).toThrowError('"engine" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        icon: 1,
      } as any)).toThrowError('"icon" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        appVersion: 1,
      } as any)).toThrowError('"appVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        tillerVersion: 1,
      } as any)).toThrowError('"tillerVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        deprecated: 1,
      } as any)).toThrowError('"deprecated" must be a boolean');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        keywords: 1,
      } as any)).toThrowError('"keywords" must be an array');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        sources: 1,
      } as any)).toThrowError('"sources" must be an array');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        maintainers: 1,
      } as any)).toThrowError('"maintainers" must be an array');
    });

    it("should filter non-string keywords", () => {
      const chart = HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        keywords: [1, "a", false, {}, "b"] as any,
      });

      expect(chart.keywords).toStrictEqual(["a", "b"]);
    });

    it("should filter non-string sources", () => {
      const chart = HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        sources: [1, "a", false, {}, "b"] as any,
      });

      expect(chart.sources).toStrictEqual(["a", "b"]);
    });

    it("should filter invalid maintainers", () => {
      const chart = HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        maintainers: [{
          name: "a",
          email: "b",
          url: "c",
        }] as any,
      });

      expect(chart.maintainers).toStrictEqual([{
        name: "a",
        email: "b",
        url: "c",
      }]);
    });

    it("should warn on unknown fields", () => {
      HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        maintainers: [{
          name: "a",
          email: "b",
          url: "c",
        }] as any,
        "asdjhajksdhadjks": 1,
      } as any);

      expect(logger.warn).toHaveBeenCalledWith("HelmChart data has unexpected fields", {
        original: anyObject(),
        unknownFields: ["asdjhajksdhadjks"],
      });
    });
  });
});
