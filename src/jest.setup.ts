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

global.setImmediate = global.setImmediate ?? (<TArgs extends any[]>(callback: (...args: TArgs) => void, ...args: TArgs) => setTimeout(() => callback(...args), 0));

process.on("unhandledRejection", (err: any) => {
  fail(err);
});
