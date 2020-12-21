import { parseJsonPath } from "../jsonPath";

describe("parseJsonPath", () => {
  test("should convert \\. to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.kubesphere\\.io/alias-name");

    expect(res).toBe(".metadata.labels['kubesphere.io/alias-name']");
  });

  test("should convert keys with escpaped charatecrs to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.kubesphere\\\"io/alias-name");

    expect(res).toBe(".metadata.labels['kubesphere\"io/alias-name']");
  });

  test("should convert '-' to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.alias-name");

    expect(res).toBe(".metadata.labels['alias-name']");
  });

  test("should handle scenario when both \\. and indexed notation are present", () => {
    const rest = parseJsonPath(".metadata.labels\\.serving['some.other.item']");

    expect(rest).toBe(".metadata['labels.serving']['some.other.item']");
  });


  test("should not touch given jsonPath if no invalid characters present", () => {
    const res = parseJsonPath(".status.conditions[?(@.type=='Ready')].status");

    expect(res).toBe(".status.conditions[?(@.type=='Ready')].status");
  });

  test("strips '\\' away from the result", () => {
    const res = parseJsonPath(".metadata.labels['serving\\.knative\\.dev/configuration']");

    expect(res).toBe(".metadata.labels['serving.knative.dev/configuration']");
  });

});
