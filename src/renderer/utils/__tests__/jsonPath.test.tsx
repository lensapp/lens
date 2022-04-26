/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { convertKubectlJsonPathToNodeJsonPath, safeJSONPathValue } from "../jsonPath";

describe("parseJsonPath", () => {
  it("should convert \\. to use indexed notation", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels.kubesphere\\.io/alias-name");

    expect(res).toBe("$.metadata.labels['kubesphere.io/alias-name']");
  });

  it("should convert keys with escaped characters to use indexed notation", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels.kubesphere\\\"io/alias-name");

    expect(res).toBe("$.metadata.labels['kubesphere\"io/alias-name']");
  });

  it("should convert '-' to use indexed notation", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels.alias-name");

    expect(res).toBe("$.metadata.labels['alias-name']");
  });

  it("should drop leading dot if first group is converted to index notation", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata\\.labels.alias-name");

    expect(res).toBe("$['metadata.labels']['alias-name']");
  });

  it("should handle scenario when both \\. and indexed notation are present", () => {
    const rest = convertKubectlJsonPathToNodeJsonPath(".metadata.labels\\.serving['some.other.item']");

    expect(rest).toBe("$.metadata['labels.serving']['some.other.item']");
  });

  it("should not touch given jsonPath if no invalid characters present", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".status.conditions[?(@.type=='Ready')].status");

    expect(res).toBe("$.status.conditions[?(@.type=='Ready')].status");
  });

  it("strips '\\' away from the result", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels['serving\\.knative\\.dev/configuration']");

    expect(res).toBe("$.metadata.labels['serving.knative.dev/configuration']");
  });

  it("converts all [] to [0]", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels[].foo[]");

    expect(res).toBe("$.metadata.labels[0].foo[0]");
  });

  it("removes trailing ..", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels[]..");

    expect(res).toBe("$.metadata.labels[0]");
  });

  it("converts ending ...name to ..name", () => {
    const res = convertKubectlJsonPathToNodeJsonPath(".metadata.labels[]...name");

    expect(res).toBe("$.metadata.labels[0]..name");
  });
});

describe("safeJSONPathValue", () => {
  let oldWarn: typeof console["warn"];

  beforeEach(() => {
    oldWarn = console.warn;
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = oldWarn;
  });

  it("should convert boolean values to strings", () => {
    const res = safeJSONPathValue({ bar: false }, ".bar");

    expect(res).toBe("false");
  });

  it("should convert number values to strings", () => {
    const res = safeJSONPathValue({ bar: 0 }, ".bar");

    expect(res).toBe("0");
  });

  it("should join sliced entries with commas only", () => {
    const res = safeJSONPathValue({
      bar: [
        {
          foo: 1,
        },
        {
          foo: "hello",
        },
      ],
    }, ".bar[].foo");

    expect(res).toBe("1");
  });

  it("should join an array of values using JSON.stringify", () => {
    const res = safeJSONPathValue({
      bar: [
        "world",
        "hello",
      ],
    }, ".bar");

    expect(res).toBe(`["world","hello"]`);
  });

  it("should stringify an object value", () => {
    const res = safeJSONPathValue({
      foo: { bar: "bat" },
    }, ".foo");

    expect(res).toBe(`{"bar":"bat"}`);
  });

  it("should use convertKubectlJsonPathToNodeJsonPath", () => {
    const res = safeJSONPathValue({
      foo: { "hello.world": "bat" },
    }, ".foo.hello\\.world");

    expect(res).toBe("bat");
  });

  it("should not throw when given '.spec.metrics[*].external.highWatermark..'", () => {
    const obj = {
      spec: {
        metrics: [
          {
            external: {
              metricName: "cpu",
              highWatermark: "100",
            },
          },
          {
            external: {
              metricName: "memory",
              highWatermark: "100",
            },
          },
        ],
      },
    };

    const res = safeJSONPathValue(obj, ".spec.metrics[*].external.highWatermark..");

    expect(res).toBe("100, 100");
  });

  it("should not throw if path is invalid jsonpath", () => {
    const res = safeJSONPathValue({
      foo: { "hello.world": "bat" },
    }, "asd[");

    expect(res).toBe("<unknown>");
  });
});
