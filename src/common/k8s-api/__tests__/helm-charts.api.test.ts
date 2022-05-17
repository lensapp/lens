/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { anyObject } from "jest-mock-extended";
import { HelmChart } from "../endpoints/helm-charts.api";

describe("HelmChart tests", () => {
  describe("HelmChart.create() tests", () => {
    it("should throw on non-object input", () => {
      expect(() => HelmChart.create("" as never)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(1 as never)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(false as never)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create([] as never)).toThrowError('"value" must be of type object');
      expect(() => HelmChart.create(Symbol() as never)).toThrowError('"value" must be of type object');
    });

    it("should throw on missing fields", () => {
      expect(() => HelmChart.create({} as never)).toThrowError('"apiVersion" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
      } as never)).toThrowError('"name" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
      } as never)).toThrowError('"version" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
      } as never)).toThrowError('"repo" is required');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
        repo: "!",
      } as never)).toThrowError('"created" is required');
    });

    it("should throw on fields being wrong type", () => {
      expect(() => HelmChart.create({
        apiVersion: 1,
        name: "!",
        version: "!",
        repo: "!",
        created: "!",
        digest: "!",
      } as never)).toThrowError('"apiVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: 1,
        version: "!",
        repo: "!",
        created: "!",
        digest: "!",
      } as never)).toThrowError('"name" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "!",
        name: "!",
        version: "!",
        repo: "!",
        created: "!",
        digest: 1,
      } as never)).toThrowError('"digest" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "",
        version: 1,
        repo: "!",
        created: "!",
        digest: "!",
      } as never)).toThrowError('"version" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: 1,
        created: "!",
        digest: "!",
      } as never)).toThrowError('"repo" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        created: 1,
        digest: "a",
      } as never)).toThrowError('"created" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        created: "!",
        digest: 1,
      } as never)).toThrowError('"digest" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        kubeVersion: 1,
      } as never)).toThrowError('"kubeVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        description: 1,
      } as never)).toThrowError('"description" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        home: 1,
      } as never)).toThrowError('"home" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        engine: 1,
      } as never)).toThrowError('"engine" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        icon: 1,
      } as never)).toThrowError('"icon" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        appVersion: 1,
      } as never)).toThrowError('"appVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        tillerVersion: 1,
      } as never)).toThrowError('"tillerVersion" must be a string');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        deprecated: 1,
      } as never)).toThrowError('"deprecated" must be a boolean');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        keywords: 1,
      } as never)).toThrowError('"keywords" must be an array');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        sources: 1,
      } as never)).toThrowError('"sources" must be an array');
      expect(() => HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        maintainers: 1,
      } as never)).toThrowError('"maintainers" must be an array');
    });

    it("should filter non-string keywords", () => {
      const chart = HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        keywords: [1, "a", false, {}, "b"] as never,
      });

      expect(chart?.keywords).toStrictEqual(["a", "b"]);
    });

    it("should filter non-string sources", () => {
      const chart = HelmChart.create({
        apiVersion: "1",
        name: "1",
        version: "1",
        repo: "1",
        digest: "1",
        created: "!",
        sources: [1, "a", false, {}, "b"] as never,
      });

      expect(chart?.sources).toStrictEqual(["a", "b"]);
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
        }] as never,
      });

      expect(chart?.maintainers).toStrictEqual([{
        name: "a",
        email: "b",
        url: "c",
      }]);
    });

    it("should warn on unknown fields", () => {
      const { warn } = console;
      const warnFn = console.warn = jest.fn();

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
        }] as never,
        "asdjhajksdhadjks": 1,
      } as never);

      expect(warnFn).toHaveBeenCalledWith("HelmChart data has unexpected fields", {
        original: anyObject(),
        unknownFields: ["asdjhajksdhadjks"],
      });
      console.warn = warn;
    });
  });
});
