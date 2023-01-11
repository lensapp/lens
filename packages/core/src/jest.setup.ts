/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { configure } from "mobx";
import { setImmediate } from "timers";
import { TextEncoder, TextDecoder as TextDecoderNode } from "util";
import glob from "glob";
import path from "path";
import { enableMapSet, setAutoFreeze } from "immer";

declare global {
  interface InjectablePaths {
    paths: string[];
    globalOverridePaths: string[];
  }

  // eslint-disable-next-line no-var
  var injectablePaths: Record<"main" | "renderer", InjectablePaths>;
}

configure({
  // Needed because we want to use jest.spyOn()
  // ref https://github.com/mobxjs/mobx/issues/2784
  safeDescriptors: false,
  enforceActions: "never",
});

setAutoFreeze(false); // allow to merge mobx observables
enableMapSet(); // allow to merge maps and sets

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

jest.mock("monaco-editor");

const getInjectables = (environment: "renderer" | "main", filePathGlob: string) => [
  ...glob.sync(`./{common,extensions,${environment}}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),

  ...glob.sync(`./features/**/{${environment},common}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),
].map(x => path.resolve(__dirname, x));

global.injectablePaths = {
  renderer: {
    globalOverridePaths: getInjectables("renderer", "*.global-override-for-injectable.{ts,tsx}"),
    paths: getInjectables("renderer", "*.{injectable,injectable.testing-env}.{ts,tsx}"),
  },
  main: {
    globalOverridePaths: getInjectables("main", "*.global-override-for-injectable.{ts,tsx}"),
    paths: getInjectables("main", "*.{injectable,injectable.testing-env}.{ts,tsx}"),
  },
};
