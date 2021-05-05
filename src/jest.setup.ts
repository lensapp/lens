import configurePackages from "./common/configure-packages";
import fetchMock from "jest-fetch-mock";

// setup default configuration for external npm-packages
configurePackages();

// rewire global.fetch to call 'fetchMock'
fetchMock.enableMocks();

// Mock __non_webpack_require__ for tests
globalThis.__non_webpack_require__ = jest.fn();

process.on("unhandledRejection", (err) => {
  fail(err);
});
