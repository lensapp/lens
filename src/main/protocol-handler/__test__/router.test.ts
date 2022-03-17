/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";

import { broadcastMessage } from "../../../common/ipc";
import { ProtocolHandlerExtension, ProtocolHandlerInternal } from "../../../common/protocol-handler";
import { delay, noop } from "../../../common/utils";
import { LensExtension } from "../../../extensions/main-api";
import { ExtensionsStore } from "../../../extensions/extensions-store/extensions-store";
import type { LensProtocolRouterMain } from "../lens-protocol-router-main/lens-protocol-router-main";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import lensProtocolRouterMainInjectable from "../lens-protocol-router-main/lens-protocol-router-main.injectable";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";

jest.mock("../../../common/ipc");

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  // TODO: This test suite is using any to access protected property.
  // Unit tests are allowed to only public interfaces.
  let extensionLoader: any;
  let lpr: LensProtocolRouterMain;
  let extensionsStore: ExtensionsStore;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs({
      "tmp": {},
    });

    di.override(extensionsStoreInjectable, () => ExtensionsStore.createInstance());

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);

    await di.runSetups();

    extensionLoader = di.inject(extensionLoaderInjectable);

    extensionsStore = di.inject(extensionsStoreInjectable);

    lpr = di.inject(lensProtocolRouterMainInjectable);

    lpr.rendererLoaded = true;
  });

  afterEach(() => {
    jest.clearAllMocks();

    mockFs.restore();
  });

  it("should throw on non-lens URLS", async () => {
    try {
      expect(await lpr.route("https://google.ca")).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should throw when host not internal or extension", async () => {
    try {
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

    ext.protocolHandlers.push({
      pathSchema: "/",
      handler: noop,
    });

    extensionLoader.instances.set(extId, ext);
    extensionsStore.mergeState([[extId, { enabled: true, name: "@mirantis/minikube" }]]);

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

    extensionLoader.instances.set(extId, ext);
    extensionsStore.mergeState([[extId, { enabled: true, name: "@foobar/icecream" }]]);

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

      extensionLoader.instances.set(extId, ext);
      extensionsStore.mergeState([[extId, { enabled: true, name: "@foobar/icecream" }]]);
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

      extensionLoader.instances.set(extId, ext);
      extensionsStore.mergeState([[extId, { enabled: true, name: "icecream" }]]);
    }

    extensionsStore.mergeState([
      ["@foobar/icecream", { enabled: true, name: "@foobar/icecream" }],
      ["icecream", { enabled: true, name: "icecream" }],
    ]);

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
    expect(() => lpr.addInternalHandler("/:@", noop)).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", async () => {
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
