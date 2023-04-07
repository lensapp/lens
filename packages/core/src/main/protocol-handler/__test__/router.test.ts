/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";

import { ProtocolHandlerExtension, ProtocolHandlerInternal, ProtocolHandlerInvalid } from "../../../common/protocol-handler";
import { noop } from "@k8slens/utilities";
import type { LensProtocolRouterMain } from "../lens-protocol-router-main/lens-protocol-router-main";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import lensProtocolRouterMainInjectable from "../lens-protocol-router-main/lens-protocol-router-main.injectable";
import type { ObservableMap } from "mobx";
import { runInAction } from "mobx";
import extensionInstancesInjectable from "../../../extensions/extension-loader/extension-instances.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";
import type { LensExtensionState } from "../../../features/extensions/enabled/common/state.injectable";
import enabledExtensionsStateInjectable from "../../../features/extensions/enabled/common/state.injectable";
import type { LegacyLensExtension, LensExtensionId } from "@k8slens/legacy-extensions";
import { LensMainExtension } from "../../../extensions/lens-main-extension";

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  let extensionInstances: ObservableMap<LensExtensionId, LegacyLensExtension>;
  let lpr: LensProtocolRouterMain;
  let enabledExtensions: ObservableMap<LensExtensionId, LensExtensionState>;
  let broadcastMessageMock: jest.Mock;

  beforeEach(async () => {
    const di = getDiForUnitTesting();

    enabledExtensions = di.inject(enabledExtensionsStateInjectable);
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");

    broadcastMessageMock = jest.fn();
    di.override(broadcastMessageInjectable, () => broadcastMessageMock);

    extensionInstances = di.inject(extensionInstancesInjectable);
    lpr = di.inject(lensProtocolRouterMainInjectable);

    runInAction(() => {
      lpr.rendererLoaded.set(true);
    });
  });

  it("should broadcast invalid protocol on non-lens URLs", async () => {
    await lpr.route("https://google.ca");
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInvalid, "invalid protocol", "https://google.ca");
  });

  it("should broadcast invalid host on non internal or non extension URLs", async () => {
    await lpr.route("lens://foobar");
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInvalid, "invalid host", "lens://foobar");
  });

  it("should broadcast internal route when called with valid host", async () => {
    lpr.addInternalHandler("/", noop);

    try {
      expect(await lpr.route("lens://app")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(broadcastMessageMock).toHaveBeenCalledWith(ProtocolHandlerInternal, "lens://app", "matched");
  });

  it("should broadcast external route when called with valid host", async () => {
    const extId = uuid.v4();
    const ext = new LensMainExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@mirantis/minikube",
        version: "0.1.1",
        engines: { lens: "^5.5.0" },
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

    extensionInstances.set(extId, ext);
    enabledExtensions.set(extId, { name: "@mirantis/minikube", enabled: true });

    lpr.addInternalHandler("/", noop);

    try {
      expect(await lpr.route("lens://app")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(broadcastMessageMock).toHaveBeenCalledWith(ProtocolHandlerInternal, "lens://app", "matched");

    try {
      expect(await lpr.route("lens://extension/@mirantis/minikube")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(broadcastMessageMock).toHaveBeenCalledWith(ProtocolHandlerExtension, "lens://extension/@mirantis/minikube", "matched");
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
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page", "matched");
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
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo", "matched");
  });

  it("should call most exact handler for an extension", async () => {
    let called: any = 0;

    const extId = uuid.v4();
    const ext = new LensMainExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@foobar/icecream",
        version: "0.1.1",
        engines: { lens: "^5.5.0" },
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

    extensionInstances.set(extId, ext);
    enabledExtensions.set(extId, { name: "@foobar/icecream", enabled: true });

    try {
      expect(await lpr.route("lens://extension/@foobar/icecream/page/foob")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe("foob");
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/@foobar/icecream/page/foob", "matched");
  });

  it("should work with non-org extensions", async () => {
    let called: any = 0;

    {
      const extId = uuid.v4();
      const ext = new LensMainExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "@foobar/icecream",
          version: "0.1.1",
          engines: { lens: "^5.5.0" },
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

      extensionInstances.set(extId, ext);
      enabledExtensions.set(extId, { name: "@foobar/icecream", enabled: true });
    }

    {
      const extId = uuid.v4();
      const ext = new LensMainExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "icecream",
          version: "0.1.1",
          engines: { lens: "^5.5.0" },
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

      extensionInstances.set(extId, ext);
      enabledExtensions.set(extId, { name: "icecream", enabled: true });
    }

    try {
      expect(await lpr.route("lens://extension/icecream/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }


    expect(called).toBe(1);
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/icecream/page", "matched");
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
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat", "matched");
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
    expect(broadcastMessageMock).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat", "matched");
  });
});
