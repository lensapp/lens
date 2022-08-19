/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { ResolveSystemProxy } from "../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";
import { resolveSystemProxyInjectionToken } from "../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";
import resolveSystemProxyFromElectronInjectable from "../../main/utils/resolve-system-proxy/resolve-system-proxy-from-electron.injectable";
import { getPromiseStatus } from "../../common/test-utils/get-promise-status";

describe("resolve-system-proxy", () => {
  let builder: ApplicationBuilder;
  let actualPromise: Promise<string>;
  let resolveSystemProxyFromElectronMock: AsyncFnMock<ResolveSystemProxy>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    resolveSystemProxyFromElectronMock = asyncFn();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(
        resolveSystemProxyFromElectronInjectable,
        () => resolveSystemProxyFromElectronMock,
      );
    });

    await builder.render();
  });

  describe("given in main, when called with URL", () => {
    beforeEach(async () => {
      const resolveSystemProxyInMain = builder.mainDi.inject(
        resolveSystemProxyInjectionToken,
      );

      actualPromise = resolveSystemProxyInMain("some-url");
    });

    it("calls for proxy of the URL from Electron", () => {
      expect(resolveSystemProxyFromElectronMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when the call for proxy resolves, resolves with the proxy", async () => {
      resolveSystemProxyFromElectronMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });

  describe("given in renderer, when called with URL", () => {
    beforeEach(async () => {
      const windowDi = builder.applicationWindow.only.di;

      const resolveSystemProxyInRenderer = windowDi.inject(
        resolveSystemProxyInjectionToken,
      );

      actualPromise = resolveSystemProxyInRenderer("some-url");
    });

    it("calls for proxy of the URL from Electron", () => {
      expect(resolveSystemProxyFromElectronMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when the call for proxy resolves, resolves with the proxy", async () => {
      resolveSystemProxyFromElectronMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });
});
