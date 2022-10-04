/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fetchMock from "jest-fetch-mock";
import configurePackages from "./common/configure-packages";
import { configure } from "mobx";
import { setImmediate } from "timers";
import { TextEncoder, TextDecoder as TextDecoderNode } from "util";
import glob from "glob";
import path from "path";

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
jest.mock("./renderer/components/tooltip/withTooltip");

const getInjectables = (environment: "renderer" | "main", filePathGlob: string) => [
  ...glob.sync(`./{common,extensions,${environment}}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),

  ...glob.sync(`./features/**/{${environment},common}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),
].map(x => path.resolve(__dirname, x));

(global as any).rendererInjectablePaths = getInjectables("renderer", "*.injectable.{ts,tsx}");
(global as any).rendererGlobalOverridePaths = getInjectables("renderer", "*.global-override-for-injectable.{ts,tsx}");
(global as any).mainInjectablePaths = getInjectables("main", "*.injectable.{ts,tsx}");
(global as any).mainGlobalOverridePaths = getInjectables("main", "*.global-override-for-injectable.{ts,tsx}");
