import getMultiExportConfig from "./get-multi-export-config";

describe("get-multi-export-config", () => {
  let actual;
  let maximalPackageJson;

  beforeEach(() => {
    maximalPackageJson = {
      name: "some-name",

      lensMultiExportConfig: {
        ".": {
          buildType: "node",
          entrypoint: "./index.ts",
        },

        "./some-entrypoint": {
          buildType: "node",
          entrypoint: "./some-entrypoint/index.ts",
        },

        "./some-other-entrypoint": {
          buildType: "react",
          entrypoint: "./some-other-entrypoint/index.ts",
        },
      },

      exports: {
        ".": {
          types: "./dist/index.d.ts",
          require: "./dist/index.js",
          import: "./dist/index.js",
          default: "./dist/index.js",
        },
        "./some-entrypoint": {
          types: "./dist/some-entrypoint/index.d.ts",
          require: "./dist/some-entrypoint/index.js",
          import: "./dist/some-entrypoint/index.js",
          default: "./dist/some-entrypoint/index.js",
        },
        "./some-other-entrypoint": {
          types: "./dist/some-other-entrypoint/index.d.ts",
          require: "./dist/some-other-entrypoint/index.js",
          import: "./dist/some-other-entrypoint/index.js",
          default: "./dist/some-other-entrypoint/index.js",
        },
      },
    };
  });

  it("given maximal package.json, when creating configuration, works", () => {
    actual = getMultiExportConfig(maximalPackageJson, {
      nodeConfig: nodeConfigStub,
      reactConfig: reactConfigStub,
    });

    expect(actual).toEqual([
      {
        name: "./index.ts",
        stub: "node",
        entry: { index: "./index.ts" },
        output: { some: "value", path: "/some-build-directory" },
      },

      {
        name: "./some-entrypoint/index.ts",
        stub: "node",
        entry: { index: "./some-entrypoint/index.ts" },

        output: {
          some: "value",
          path: "/some-build-directory/some-entrypoint",
        },
      },

      {
        name: "./some-other-entrypoint/index.ts",
        stub: "react",
        entry: { index: "./some-other-entrypoint/index.ts" },

        output: {
          some: "other-value",
          path: "/some-build-directory/some-other-entrypoint",
        },
      },
    ]);
  });

  it("given maximal package.json but path for entrypoint in exports do not match output, when creating configuration, throws", () => {
    maximalPackageJson.exports["./some-entrypoint"].default = "wrong-path";

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but exports do not match lens multi export config, when creating configuration, throws", () => {
    maximalPackageJson.exports = {};

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but exports are missing, when creating configuration, throws", () => {
    delete maximalPackageJson.exports;

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but lens multi export config is missing, when creating configuration, throws", () => {
    delete maximalPackageJson.lensMultiExportConfig;

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config for package "some-name" but configuration is missing.'
    );
  });

  it("given maximal package.json but a build type is incorrect, when creating configuration, throws", () => {
    maximalPackageJson.lensMultiExportConfig["."].buildType = "some-invalid";

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config for package "some-name" but build types "some-invalid" were not any of "node", "react".'
    );
  });

  it("given maximal package.json but entrypoint is missing, when creating configuration, throws", () => {
    delete maximalPackageJson.lensMultiExportConfig["./some-entrypoint"]
      .entrypoint;

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        nodeConfig: nodeConfigStub,
        reactConfig: reactConfigStub,
      });
    }).toThrow(
      'Tried to get multi export config for package "some-name" but entrypoint was missing for "./some-entrypoint".'
    );
  });
});

const nodeConfigStub = {
  stub: "node",
  output: {
    some: "value",
    path: "/some-build-directory",
  },
};

const reactConfigStub = {
  stub: "react",

  output: {
    some: "other-value",
    path: "/some-build-directory",
  },
};
