/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { ResolveProxy } from "./common/resolve-proxy-injection-token";
import { resolveProxyInjectionToken } from "./common/resolve-proxy-injection-token";
import resolveProxyFromElectronInjectable from "./main/resolve-proxy-from-electron.injectable";
import { getPromiseStatus } from "../../../common/test-utils/get-promise-status";

describe("resolve-proxy", () => {
  let applicationBuilder: ApplicationBuilder;
  let actualPromise: Promise<string>;
  let resolveProxyFromElectronMock: AsyncFnMock<ResolveProxy>;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    resolveProxyFromElectronMock = asyncFn();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(
        resolveProxyFromElectronInjectable,
        () => resolveProxyFromElectronMock,
      );
    });

    await applicationBuilder.render();
  });

  describe("given in main, when called with URL", () => {
    beforeEach(async () => {
      const resolveProxyInMain = applicationBuilder.dis.mainDi.inject(
        resolveProxyInjectionToken,
      );

      actualPromise = resolveProxyInMain("some-url");
    });

    it("calls for proxy of the URL from Electron", () => {
      expect(resolveProxyFromElectronMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when the call for proxy resolves, resolves with the proxy", async () => {
      resolveProxyFromElectronMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });

  describe("given in renderer, when called with URL", () => {
    beforeEach(async () => {
      const resolveProxyInRenderer = applicationBuilder.dis.rendererDi.inject(
        resolveProxyInjectionToken,
      );

      actualPromise = resolveProxyInRenderer("some-url");
    });

    it("calls for proxy of the URL from Electron", () => {
      expect(resolveProxyFromElectronMock).toHaveBeenCalledWith("some-url");
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when the call for proxy resolves, resolves with the proxy", async () => {
      resolveProxyFromElectronMock.resolve("some-proxy");

      expect(await actualPromise).toBe("some-proxy");
    });
  });
});
