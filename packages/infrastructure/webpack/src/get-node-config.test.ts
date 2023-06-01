import { getNodeConfig } from "./get-node-config";

describe("get-node-config", () => {
  it("given an environment, works", () => {
    const actual = getNodeConfig({
      entrypointFilePath: "some-entrypoint-file-path",
      outputDirectory: "some-output-directory",
      environment: { mode: "development", devtool: "some-devtool" },
    });

    expect(actual).toMatchSnapshot();
  });
});
