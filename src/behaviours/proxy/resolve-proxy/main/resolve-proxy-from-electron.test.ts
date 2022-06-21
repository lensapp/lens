/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../../main/getDiForUnitTesting";
import resolveProxyFromElectronInjectable from "./resolve-proxy-from-electron.injectable";
import electronInjectable from "./electron.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type electron from "electron";
import { getPromiseStatus } from "../../../../common/test-utils/get-promise-status";

describe("technical: resolve-proxy-from-electron", () => {
  let resolveProxyMock: AsyncFnMock<(url: string) => Promise<string>>;

  describe("given there are non-destroyed Lens windows, when called with URL", () => {
    let actualPromise: Promise<string>;

    beforeEach(() => {
      const di = getDiForUnitTesting();

      resolveProxyMock = asyncFn();

      di.override(
        electronInjectable,

        () =>
          ({
            webContents: {
              getAllWebContents: () => [
                {
                  isDestroyed: () => true,

                  session: {
                    resolveProxy: () => {
                      throw new Error("should never come here");
                    },
                  },
                },

                {
                  isDestroyed: () => false,
                  session: { resolveProxy: resolveProxyMock },
                },

                {
                  isDestroyed: () => false,

                  session: {
                    resolveProxy: () => {
                      throw new Error("should never come here");
                    },
                  },
                },
              ],
            },
          } as unknown as typeof electron),
      );

      const resolveProxyFromElectron = di.inject(
        resolveProxyFromElectronInjectable,
      );

      actualPromise = resolveProxyFromElectron("some-url");
    });

    it("calls to resolve proxy from the first window", () => {
      expect(resolveProxyMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when call for proxy, resolves with the proxy", async () => {
      resolveProxyMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });
});
