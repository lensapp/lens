module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  moduleNameMapper: {
    "\\.(scss)$": "identity-obj-proxy",
  },
  moduleDirectories: ["node_modules"],
  setupFilesAfterEnv: ["./setup-tests.js"],
  globals: {
    "ts-jest": {
      "tsConfig": "./test/tsconfig.json"
    }
  },
  roots: [
    "../client"
  ],
};