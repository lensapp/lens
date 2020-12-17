import { parseJsonPath } from "../jsonPath";

describe("parseJsonPath", () => {
  test("should convert \. to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.kubesphere\\.io/alias-name");

    expect(res).toBe(".metadata['labels']['kubesphere.io/alias-name']");

  });

  test("strips '\' away from the result", () => {
    const res = parseJsonPath(".metadata.labels['serving\\.knative\\.dev/configuration']");

    expect(res).toBe(".metadata.labels['serving.knative.dev/configuration']");
  });

  test("should not touch given jsonPath if no invalid characters", () => {
    const res = parseJsonPath(".status.conditions[?(@.type=='Ready')].status");

    expect(res).toBe(".status.conditions[?(@.type=='Ready')].status");
  });
});
