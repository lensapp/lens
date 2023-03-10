import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import getMultiExportConfig from "./get-multi-export-config";
import path from "path";
const getReactConfigFor = require("./get-react-config");

const resolvePathFake = path.posix.resolve;

describe("get-multi-export-config", () => {
  let configs;
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

  describe("given maximal package.json, when creating configuration", () => {
    beforeEach(() => {
      configs = getMultiExportConfig(maximalPackageJson, {
        resolvePath: resolvePathFake,
        workingDirectory: "/some-working-directory",

        getReactConfig: getReactConfigFor({
          miniCssExtractPluginLoader: { some: "miniCssExtractPluginLoader" },
        }),
      });
    });

    it("works", () => {
      expect(configs).toMatchSnapshot();
    });

    [
      {
        name: "config for node export in default entrypoint",
        entrypoint: "./index.ts",
        outputDirectory: "/some-working-directory/dist",
      },
      {
        name: "config for node export in a non-default entrypoint",
        entrypoint: "./some-entrypoint/index.ts",
        outputDirectory: "/some-working-directory/dist/some-entrypoint",
      },
      {
        name: "config for react export in a non-default entrypoint",
        entrypoint: "./some-other-entrypoint/index.ts",
        outputDirectory: "/some-working-directory/dist/some-other-entrypoint",
      },
    ].forEach((scenario) => {
      describe(scenario.name, () => {
        let config;

        beforeEach(() => {
          config = configs.find(({ name }) => name === scenario.entrypoint);
        });

        it("has correct entrypoint", () => {
          expect(config).toHaveProperty("entry.index", scenario.entrypoint);
        });

        it("has correct output directory", () => {
          expect(config).toHaveProperty(
            "output.path",
            scenario.outputDirectory
          );
        });

        it("has correct declaration directory", () => {
          expect(
            config.plugins.find(
              ({ constructor }) => constructor === ForkTsCheckerPlugin
            )
          ).toHaveProperty(
            "options.typescript.configOverwrite.compilerOptions.declarationDir",
            scenario.outputDirectory
          );
        });
      });
    });
  });

  it("given maximal package.json but path for entrypoint in exports do not match output, when creating configuration, throws", () => {
    maximalPackageJson.exports["./some-entrypoint"].default = "wrong-path";

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but exports do not match lens multi export config, when creating configuration, throws", () => {
    maximalPackageJson.exports = {};

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but exports are missing, when creating configuration, throws", () => {
    delete maximalPackageJson.exports;

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
      });
    }).toThrow(
      'Tried to get multi export config but exports of package.json for "some-name" did not match exactly:'
    );
  });

  it("given maximal package.json but lens multi export config is missing, when creating configuration, throws", () => {
    delete maximalPackageJson.lensMultiExportConfig;

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
      });
    }).toThrow(
      'Tried to get multi export config for package "some-name" but configuration is missing.'
    );
  });

  it("given maximal package.json but a build type is incorrect, when creating configuration, throws", () => {
    maximalPackageJson.lensMultiExportConfig["."].buildType = "some-invalid";

    expect(() => {
      getMultiExportConfig(maximalPackageJson, {
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
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
        getNodeConfig: () => nodeConfigStub,
        getReactConfig: () => reactConfigStub,
        joinPath: resolvePathFake,
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
