/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as uuid from "uuid";

import { broadcastMessage } from "../../../common/ipc";
import { ProtocolHandlerExtension, ProtocolHandlerInternal } from "../../../common/protocol-handler";
import { delay, noop } from "../../../common/utils";
import { LensExtension } from "../../../extensions/main-api";
import { ExtensionLoader } from "../../../extensions/extension-loader";
import { ExtensionsStore } from "../../../extensions/extensions-store";
import { LensProtocolRouterMain } from "../router";
import mockFs from "mock-fs";
import { AppPaths } from "../../../common/app-paths";

jest.mock("../../../common/ipc");

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

AppPaths.init();

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  beforeEach(() => {
    mockFs({
      "tmp": {},
    });
    ExtensionsStore.createInstance();
    ExtensionLoader.createInstance();

    const lpr = LensProtocolRouterMain.createInstance();

    lpr.rendererLoaded = true;
  });

  afterEach(() => {
    jest.clearAllMocks();

    ExtensionsStore.resetInstance();
    ExtensionLoader.resetInstance();
    LensProtocolRouterMain.resetInstance();
    mockFs.restore();
  });

  it("should throw on non-lens URLS", async () => {
    try {
      const lpr = LensProtocolRouterMain.getInstance();

      expect(await lpr.route("https://google.ca")).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should throw when host not internal or extension", async () => {
    try {
      const lpr = LensProtocolRouterMain.getInstance();

      expect(await lpr.route("lens://foobar")).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should not throw when has valid host", async () => {
    const extId = uuid.v4();
    const ext = new LensExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@mirantis/minikube",
        version: "0.1.1",
      },
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
      absolutePath: "/foo/bar",
    });
    const lpr = LensProtocolRouterMain.getInstance();

    ext.protocolHandlers.push({
      pathSchema: "/",
      handler: noop,
    });

    (ExtensionLoader.getInstance() as any).instances.set(extId, ext);
    (ExtensionsStore.getInstance() as any).state.set(extId, { enabled: true, name: "@mirantis/minikube" });

    lpr.addInternalHandler("/", noop);

    try {
      expect(await lpr.route("lens://app")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    try {
      expect(await lpr.route("lens://extension/@mirantis/minikube")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);
    expect(broadcastMessage).toHaveBeenCalledWith(ProtocolHandlerInternal, "lens://app", "matched");
    expect(broadcastMessage).toHaveBeenCalledWith(ProtocolHandlerExtension, "lens://extension/@mirantis/minikube", "matched");
  });

  it("should call handler if matches", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called = false;

    lpr.addInternalHandler("/page", () => { called = true; });

    try {
      expect(await lpr.route("lens://app/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(true);
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page", "matched");
  });

  it("should call most exact handler", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called: any = 0;

    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/:id", params => { called = params.pathname.id; });

    try {
      expect(await lpr.route("lens://app/page/foo")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe("foo");
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo", "matched");
  });

  it("should call most exact handler for an extension", async () => {
    let called: any = 0;

    const lpr = LensProtocolRouterMain.getInstance();
    const extId = uuid.v4();
    const ext = new LensExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@foobar/icecream",
        version: "0.1.1",
      },
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
      absolutePath: "/foo/bar",
    });

    ext.protocolHandlers
      .push({
        pathSchema: "/page",
        handler: () => { called = 1; },
      }, {
        pathSchema: "/page/:id",
        handler: params => { called = params.pathname.id; },
      });

    (ExtensionLoader.getInstance() as any).instances.set(extId, ext);
    (ExtensionsStore.getInstance() as any).state.set(extId, { enabled: true, name: "@foobar/icecream" });

    try {
      expect(await lpr.route("lens://extension/@foobar/icecream/page/foob")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);
    expect(called).toBe("foob");
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/@foobar/icecream/page/foob", "matched");
  });

  it("should work with non-org extensions", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called: any = 0;

    {
      const extId = uuid.v4();
      const ext = new LensExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "@foobar/icecream",
          version: "0.1.1",
        },
        isBundled: false,
        isEnabled: true,
        isCompatible: true,
        absolutePath: "/foo/bar",
      });

      ext.protocolHandlers
        .push({
          pathSchema: "/page/:id",
          handler: params => { called = params.pathname.id; },
        });

      (ExtensionLoader.getInstance() as any).instances.set(extId, ext);
      (ExtensionsStore.getInstance() as any).state.set(extId, { enabled: true, name: "@foobar/icecream" });
    }

    {
      const extId = uuid.v4();
      const ext = new LensExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "icecream",
          version: "0.1.1",
        },
        isBundled: false,
        isEnabled: true,
        isCompatible: true,
        absolutePath: "/foo/bar",
      });

      ext.protocolHandlers
        .push({
          pathSchema: "/page",
          handler: () => { called = 1; },
        });

      (ExtensionLoader.getInstance() as any).instances.set(extId, ext);
      (ExtensionsStore.getInstance() as any).state.set(extId, { enabled: true, name: "icecream" });
    }

    (ExtensionsStore.getInstance() as any).state.set("@foobar/icecream", { enabled: true, name: "@foobar/icecream" });
    (ExtensionsStore.getInstance() as any).state.set("icecream", { enabled: true, name: "icecream" });

    try {
      expect(await lpr.route("lens://extension/icecream/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    await delay(50);

    expect(called).toBe(1);
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/icecream/page", "matched");
  });

  it("should throw if urlSchema is invalid", () => {
    const lpr = LensProtocolRouterMain.getInstance();

    expect(() => lpr.addInternalHandler("/:@", noop)).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called: any = 0;

    lpr.addInternalHandler("/", () => { called = 2; });
    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/foo", () => { called = 3; });
    lpr.addInternalHandler("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(3);
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat", "matched");
  });

  it("should call most exact handler with 2 found handlers", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called: any = 0;

    lpr.addInternalHandler("/", () => { called = 2; });
    lpr.addInternalHandler("/page", () => { called = 1; });
    lpr.addInternalHandler("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(1);
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat", "matched");
  });
});
