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
import React from "react";
import { isObject } from "@k8slens/utilities";
import type { TooltipDecoratorProps } from "@k8slens/tooltip";

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
}) as typeof global.fail;

process.on("unhandledRejection", (err) => {
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@k8slens/tooltip", () => ({
  ...jest.requireActual("@k8slens/tooltip"),
  withTooltip <TargetProps>(Target: TargetProps extends Pick<TooltipDecoratorProps, "id" | "children"> ? React.FunctionComponent<TargetProps> : never): React.FunctionComponent<TargetProps & TooltipDecoratorProps> {
    return ({ tooltip, tooltipOverrideDisabled, ...props }) => {
      void tooltipOverrideDisabled;
      const ResolvedTarget = Target as React.FunctionComponent<TargetProps>;

      if (tooltip) {
        const testId = props["data-testid"] as string | undefined;

        return (
          <>
            <ResolvedTarget {...props as (TargetProps & { children?: React.ReactNode })} />
            <div data-testid={testId && `tooltip-content-for-${testId}`}>
              {isObject(tooltip) ? tooltip.children : tooltip}
            </div>
          </>
        );
      }

      return <ResolvedTarget {...props as (TargetProps & { children?: React.ReactNode })} />;
    };
  },
}));
jest.mock("monaco-editor");

const getInjectables = (environment: "renderer" | "main", filePathGlob: string) => [
  ...glob.sync(`./{common,extensions,${environment},test-env}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),

  ...glob.sync(`./features/**/{${environment},common}/**/${filePathGlob}`, {
    cwd: __dirname,
  }),
].map(x => path.resolve(__dirname, x));

global.injectablePaths = {
  renderer: {
    globalOverridePaths: getInjectables("renderer", "*.global-override-for-injectable.{ts,tsx}"),
    paths: getInjectables("renderer", "*.injectable.{ts,tsx}"),
  },
  main: {
    globalOverridePaths: getInjectables("main", "*.global-override-for-injectable.{ts,tsx}"),
    paths: getInjectables("main", "*.injectable.{ts,tsx}"),
  },
};
