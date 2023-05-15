const path = require('path');

module.exports = (rootDir) => {
  const shared = {
    "resolver": path.join(__dirname, "jest-28-resolver.js"),

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
      "!<rootDir>/src/**/test-utils/**/*.{ts,tsx}",
      "!<rootDir>/src/**/index.{ts,tsx}",
    ],

    moduleNameMapper: {
      "^electron$": "identity-obj-proxy",
    },

    coverageThreshold: {
      global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  };

  const configForNode = {
    ...shared,
    testEnvironment: "node",
  };

  const configForReact = {
    ...shared,

    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|webp|svg)$": "identity-obj-proxy",
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
