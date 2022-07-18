/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fetchMock from "jest-fetch-mock";
import configurePackages from "./common/configure-packages";
import { configure } from "mobx";
import { setImmediate } from "timers";
import { TextEncoder, TextDecoder as TextDecoderNode } from "util";

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

global.setImmediate = setImmediate;

global.fail = ((error = "Test failed without explicit error") => {
  console.error(error);
}) as any;

process.on("unhandledRejection", (err: any) => {
  global.fail(err);
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoderNode as unknown as typeof TextDecoder;

global.ResizeObserver = class {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
};

jest.mock("./renderer/components/monaco-editor/monaco-editor");
