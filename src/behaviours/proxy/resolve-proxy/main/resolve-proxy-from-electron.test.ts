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
import createTemporaryBrowserWindowInjectable from "./create-temporary-browser-window.injectable";

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

      di.override(createTemporaryBrowserWindowInjectable, () => () => {
        throw new Error("should never come here");
      });

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

  describe("given there are only destroyed Lens windows, when called with URL", () => {
    let actualPromise: Promise<string>;
    let createTemporaryBrowserWindowMock: jest.Mock;
    let destroyTempWindowMock: jest.Mock;

    beforeEach(() => {
      const di = getDiForUnitTesting();

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

      resolveProxyMock = asyncFn();

      destroyTempWindowMock = jest.fn();

      createTemporaryBrowserWindowMock = jest.fn(() => ({
        webContents: {
          session:  {
            resolveProxy: resolveProxyMock,
          },
        },

        destroy: destroyTempWindowMock,
      }));

      di.override(createTemporaryBrowserWindowInjectable, () => createTemporaryBrowserWindowMock);

      const resolveProxyFromElectron = di.inject(
        resolveProxyFromElectronInjectable,
      );

      actualPromise = resolveProxyFromElectron("some-url");
    });

    it("creates a new temporary window for resolving proxy", () => {
      expect(createTemporaryBrowserWindowMock).toHaveBeenCalledWith();
    });

    it("calls for proxy from the temporary window", () => {
      expect(resolveProxyMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("does not destroy the temp window yet", () => {
      expect(destroyTempWindowMock).not.toHaveBeenCalled();
    });

    describe("when the call resolves", () => {
      beforeEach(async () => {
        await resolveProxyMock.resolve("some-proxy-from-temp-window");
      });

      it("destroys the temp window", () => {
        expect(destroyTempWindowMock).toHaveBeenCalled();
      });

      it("resolves with the proxy", async () => {
        expect(await actualPromise).toBe("some-proxy-from-temp-window");
      });
    });
  });
});
