/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import resolveSystemProxyFromElectronInjectable from "./resolve-system-proxy-from-electron.injectable";
import resolveSystemProxyWindowInjectable from "./resolve-system-proxy-window.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getPromiseStatus } from "@k8slens/test-utils";
import logErrorInjectable from "../../../common/log-error.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import type { BrowserWindow, Session, WebContents } from "electron";

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

  describe("given there are no unexpected issues, when called with URL", () => {
    beforeEach(() => {
      resolveSystemProxyMock = asyncFn();

      di.override(
        resolveSystemProxyWindowInjectable,
        async () => ({
          webContents: {
            session: {
              resolveProxy: resolveSystemProxyMock,
            } as unknown as Session,
          } as unknown as WebContents,
        } as unknown as BrowserWindow),
      );

      const resolveSystemProxyFromElectron = di.inject(
        resolveSystemProxyFromElectronInjectable,
      );

      actualPromise = resolveSystemProxyFromElectron("some-url");
    });

    it("calls to resolve proxy from the browser window", () => {
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

  describe("given there are unexpected issues, when called with URL", () => {
    let error: any;

    beforeEach(async () => {
      resolveSystemProxyMock = asyncFn();

      di.override(
        resolveSystemProxyWindowInjectable,
        async () => ({
          webContents: {
            session: {
              resolveProxy: () => {
                throw new Error("unexpected error");
              },
            } as unknown as Session,
          } as unknown as WebContents,
        } as unknown as BrowserWindow),
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
      expect(error.message).toBe("unexpected error");
    });

    it("logs error", () => {
      expect(logErrorMock).toHaveBeenCalledWith("Error resolving proxy", error);
    });
  });
});
