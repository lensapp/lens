/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import resolveSystemProxyFromElectronInjectable from "./resolve-system-proxy-from-electron.injectable";
import electronInjectable from "./electron.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type electron from "electron";
import { getPromiseStatus } from "../../../common/test-utils/get-promise-status";
import logErrorInjectable from "../../../common/log-error.injectable";
import type { DiContainer } from "@ogre-tools/injectable";

describe("technical: resolve-system-proxy-from-electron", () => {
  let resolveSystemProxyMock: AsyncFnMock<(url: string) => Promise<string>>;
  let logErrorMock: jest.Mock;
  let di: DiContainer;
  let actualPromise: Promise<string>;

  beforeEach(() => {
    di = getDiForUnitTesting();

    logErrorMock = jest.fn();
    di.override(logErrorInjectable, () => logErrorMock);
  });

  describe("given there are non-destroyed Lens windows, when called with URL", () => {
    beforeEach(() => {
      resolveSystemProxyMock = asyncFn();

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
                  session: { resolveProxy: resolveSystemProxyMock },
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

      const resolveSystemProxyFromElectron = di.inject(
        resolveSystemProxyFromElectronInjectable,
      );

      actualPromise = resolveSystemProxyFromElectron("some-url");
    });

    it("calls to resolve proxy from the first window", () => {
      expect(resolveSystemProxyMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when call for proxy, resolves with the proxy", async () => {
      resolveSystemProxyMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });

  describe("given there are only destroyed Lens windows, when called with URL", () => {
    let error: any;

    beforeEach(async () => {
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
              ],
            },
          } as unknown as typeof electron),
      );

      resolveSystemProxyMock = asyncFn();

      const resolveSystemProxyFromElectron = di.inject(
        resolveSystemProxyFromElectronInjectable,
      );

      try {
        await resolveSystemProxyFromElectron("some-url");
      } catch (e) {
        error = e;
      }
    });

    it("throws error", () => {
      expect(error.message).toBe('Tried to resolve proxy for "some-url", but no browser window was available');
    });

    it("logs error", () => {
      expect(logErrorMock).toHaveBeenCalledWith("Error resolving proxy", error);
    });
  });
});
