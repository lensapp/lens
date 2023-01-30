const path = require("path");
const glob = require("glob");
const { omit } = require("lodash/fp");

const getProjectColor = (projectNumber) => {
  const colors = [
    "red",
    "green",
    "yellow",
    "magenta",
    "cyan",
    "white",
    "redBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright",
    "whiteBright",
  ];

  return colors[projectNumber % colors.length];
};

const nonMultiProjectConfigs = [
  "coverageDirectory",
  "coverageProvider",
  "coverageReporters",
  "collectCoverage",
  "collectCoverageFrom",
  "coveragePathIgnorePatterns",
  "coverageThreshold",
];

const toJestMultiProjectConfig = (
  { packageJson, jestConfig, packagePath },
  projectNumber
) => ({
  rootDir: packagePath,

  displayName: {
    name: packageJson.name,
    color: getProjectColor(projectNumber),
  },

  ...omit(nonMultiProjectConfigs, jestConfig),
});

const getJestConfigsAndPackageJsons = (rootDir) => {
  const packageJsonPaths = glob
    .sync(`${rootDir}/packages/**/jest.config.js`, {
      ignore: "./**/node_modules/**/*",
    })
    .map((filePath) => path.dirname(filePath));

  return packageJsonPaths.map((packagePath) => ({
    packagePath,
    packageJson: require(`${packagePath}/package.json`),
    jestConfig: require(`${packagePath}/jest.config.js`),
  }));
};

module.exports = (rootDir) => ({
  projects: getJestConfigsAndPackageJsons(rootDir).map(
    toJestMultiProjectConfig
  ),

  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
    "jest-watch-select-projects",
  ],
});
