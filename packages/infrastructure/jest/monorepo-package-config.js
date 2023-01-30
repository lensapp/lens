module.exports = (rootDir) => {
  const shared = {
    transform: {
      "^.+\\.(t|j)sx?$": ["@swc/jest", { cwd: rootDir }],
    },

    clearMocks: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    coverageReporters: ["lcov"],
    collectCoverage: true,
    testMatch: ["**/?(*.)+(test).{js,ts,tsx}"],
    watchPathIgnorePatterns: ["/node_modules/", "/coverage/", "/build/"],

    collectCoverageFrom: [
      "<rootDir>/src/**/*.{ts,tsx}",
      "!<rootDir>/src/**/*.no-coverage.ts",
    ],

    moduleNameMapper: {
      "^electron$": "identity-obj-proxy",
    },

    // Todo: restore threshold after initial hurry.
    // coverageThreshold: {
    //   global: {
    //     branches: 100,
    //     functions: 100,
    //     lines: 100,
    //     statements: 100,
    //   },
    // },
  };

  const configForNode = {
    ...shared,
    testEnvironment: "node",
  };

  const configForReact = {
    ...shared,

    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy",
      ...shared.moduleNameMapper,
    },

    testEnvironment: "jsdom",
    setupFilesAfterEnv: [`${__dirname}/setup-react-tests.ts`],
  };

  return {
    configForReact,
    configForNode,
  };
};
