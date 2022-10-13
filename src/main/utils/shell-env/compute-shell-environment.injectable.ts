/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncResult } from "../../../common/utils/async-result";
import { getInjectable } from "@ogre-tools/injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import { disposer } from "../../../common/utils";
import computeUnixShellEnvironmentInjectable from "./compute-unix-shell-environment.injectable";

export type EnvironmentVariables = Partial<Record<string, string>>;
export type ComputeShellEnvironment = (shell: string) => Promise<AsyncResult<EnvironmentVariables | undefined, string>>;

const computeShellEnvironmentInjectable = getInjectable({
  id: "compute-shell-environment",
  instantiate: (di): ComputeShellEnvironment => {
    const isWindows = di.inject(isWindowsInjectable);
    const computeUnixShellEnvironment = di.inject(computeUnixShellEnvironmentInjectable);

    if (isWindows) {
      return async () => ({
        callWasSuccessful: true,
        response: undefined,
      });
    }

    return async (shell) => {
      const controller = new AbortController();
      const shellEnv = computeUnixShellEnvironment(shell, { signal: controller.signal });
      const cleanup = disposer();

      const timeoutHandle = setTimeout(() => controller.abort(), 30_000);

      cleanup.push(() => clearTimeout(timeoutHandle));

      try {
        return {
          callWasSuccessful: true,
          response: await shellEnv,
        };
      } catch (error) {
        if (controller.signal.aborted) {
          return {
            callWasSuccessful: false,
            error: "Resolving shell environment is taking very long. Please review your shell configuration.",
          };
        }

        return {
          callWasSuccessful: false,
          error: String(error),
        };
      } finally {
        cleanup();
      }
    };
  },
});

export default computeShellEnvironmentInjectable;

