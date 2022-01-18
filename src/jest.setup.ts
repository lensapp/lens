/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fetchMock from "jest-fetch-mock";
import configurePackages from "./common/configure-packages";
import { configure } from "mobx";

// setup default configuration for external npm-packages
configurePackages();

configure({
  // Needed because we want to use jest.spyOn()
  // ref https://github.com/mobxjs/mobx/issues/2784
  safeDescriptors: false,
});

// rewire global.fetch to call 'fetchMock'
fetchMock.enableMocks();

// Mock __non_webpack_require__ for tests
globalThis.__non_webpack_require__ = jest.fn();

process.on("unhandledRejection", (err: any) => {
  fail(err);
});
