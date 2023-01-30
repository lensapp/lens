const nodeConfig = require("./node-config");
const reactConfig = require("./react-config");
const path = require("path");
const {
  map,
  isEqual,
  keys,
  fromPairs,
  toPairs,
  reject,
  values,
  nth,
  filter,
} = require("lodash/fp");
const { pipeline } = require("@ogre-tools/fp");

module.exports = (
  packageJson,
  dependencies = { workingDirectory: process.cwd(), nodeConfig, reactConfig }
) => {
  if (!packageJson.lensMultiExportConfig) {
    throw new Error(
      `Tried to get multi export config for package "${packageJson.name}" but configuration is missing.`
    );
  }

  const validBuildTypes = ["node", "react"];

  const invalidBuildTypes = pipeline(
    packageJson.lensMultiExportConfig,
    values,
    map((config) => config.buildType),
    reject((buildType) => validBuildTypes.includes(buildType))
  );

  if (invalidBuildTypes.length > 0) {
    throw new Error(
      `Tried to get multi export config for package "${
        packageJson.name
      }" but build types "${invalidBuildTypes.join(
        '", "'
      )}" were not any of "${validBuildTypes.join('", "')}".`
    );
  }

  const exportsWithMissingEntrypoint = pipeline(
    packageJson.lensMultiExportConfig,
    toPairs,
    filter(([, config]) => !config.entrypoint),
    map(nth(0))
  );

  if (exportsWithMissingEntrypoint.length > 0) {
    throw new Error(
      `Tried to get multi export config for package "${
        packageJson.name
      }" but entrypoint was missing for "${exportsWithMissingEntrypoint.join(
        '", "'
      )}".`
    );
  }

  const expectedExports = pipeline(
    packageJson.lensMultiExportConfig,
    keys,
    map(toExpectedExport),
    fromPairs
  );

  if (!isEqual(expectedExports, packageJson.exports)) {
    throw new Error(
      `Tried to get multi export config but exports of package.json for "${
        packageJson.name
      }" did not match exactly:\n\n${JSON.stringify(expectedExports, null, 2)}`
    );
  }

  return pipeline(
    packageJson.lensMultiExportConfig,
    toPairs,
    map(toExportSpecificWebpackConfigFor(dependencies))
  );
};

const toExpectedExport = (externalImportPath) => {
  const entrypointPath = `./${path.join(
    "./build",
    externalImportPath,
    "index.js"
  )}`;

  return [
    externalImportPath,
    {
      types: `./${path.join("./build", externalImportPath, "index.d.ts")}`,

      default: entrypointPath,
      import: entrypointPath,
      require: entrypointPath,
    },
  ];
};

const getRuleWithExportSpecificDeclarationDir = (rule, outputPath, rootDir) => {
  return {
    ...rule,

    options: {
      ...rule.options,

      compilerOptions: {
        ...rule.options.compilerOptions,
        declarationDir: outputPath,
        rootDir: rootDir,
      },
    },
  };
};

const toExportSpecificWebpackConfigFor =
  (dependencies) =>
  ([externalImportPath, { buildType, entrypoint }]) => {
    const baseConfig =
      buildType === "node" ? dependencies.nodeConfig : dependencies.reactConfig;

    const outputDirectory = path.join(
      dependencies.workingDirectory,
      "build",
      externalImportPath
    );

    return {
      ...baseConfig,
      name: entrypoint,

      entry: {
        index: entrypoint,
      },

      output: {
        ...baseConfig.output,
        path: outputDirectory,
      },

      module: {
        rules: baseConfig.module.rules.map((rule) =>
          rule.loader === "ts-loader"
            ? getRuleWithExportSpecificDeclarationDir(
                rule,
                outputDirectory,
                path.join(dependencies.workingDirectory, "src")
              )
            : rule
        ),
      },
    };
  };
