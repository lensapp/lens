/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";

import { noop } from "../../../common/utils";
import type { LensProtocolRouterMain } from "../lens-protocol-router-main/lens-protocol-router-main";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import lensProtocolRouterMainInjectable from "../lens-protocol-router-main/lens-protocol-router-main.injectable";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";
import type { LensExtension, LensExtensionId } from "../../../extensions/lens-extension";
import type { ObservableMap } from "mobx";
import { runInAction } from "mobx";
import extensionInstancesInjectable from "../../../extensions/extension-loader/extension-instances.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { SendDeepLinkingAttempt } from "../../../features/deep-linking/main/send-deep-linking-attempt.injectable";
import type { SendInvalidDeepLinkingAttempt } from "../../../features/deep-linking/main/send-invalid-deep-linking-attempt.injectable";
import sendDeepLinkingAttemptInjectable from "../../../features/deep-linking/main/send-deep-linking-attempt.injectable";
import sendInvalidDeepLinkingAttemptInjectable from "../../../features/deep-linking/main/send-invalid-deep-linking-attempt.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { InternalRouteRegistration } from "../../../features/deep-linking/common/internal-handler-token";
import { internalDeepLinkingRouteInjectionToken } from "../../../features/deep-linking/common/internal-handler-token";
import { LensMainExtension } from "../../../extensions/lens-main-extension";

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  let extensionInstances: ObservableMap<LensExtensionId, LensExtension>;
  let lpr: LensProtocolRouterMain;
  let enabledExtensions: Set<string>;
  let sendDeepLinkingAttemptMock: jest.MockedFunction<SendDeepLinkingAttempt>;
  let sendInvalidDeepLinkingAttemptMock: jest.MockedFunction<SendInvalidDeepLinkingAttempt>;
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    enabledExtensions = new Set();

    di.override(extensionsStoreInjectable, () => ({
      isEnabled: (id) => enabledExtensions.has(id),
    }));

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");

    sendDeepLinkingAttemptMock = jest.fn();
    di.override(sendDeepLinkingAttemptInjectable, () => sendDeepLinkingAttemptMock);

    sendInvalidDeepLinkingAttemptMock = jest.fn();
    di.override(sendInvalidDeepLinkingAttemptInjectable, () => sendInvalidDeepLinkingAttemptMock);

    extensionInstances = di.inject(extensionInstancesInjectable);
    lpr = di.inject(lensProtocolRouterMainInjectable);

    runInAction(() => {
      lpr.rendererLoaded.set(true);
    });
  });

  it("should broadcast invalid protocol on non-lens URLs", async () => {
    await lpr.route("https://google.ca");
    expect(sendInvalidDeepLinkingAttemptMock).toBeCalledWith({
      error: "invalid protocol",
      url: "https://google.ca",
    });
  });

  it("should broadcast invalid host on non internal or non extension URLs", async () => {
    await lpr.route("lens://foobar");
    expect(sendInvalidDeepLinkingAttemptMock).toBeCalledWith({
      error: "invalid host",
      url: "lens://foobar",
    });
  });

  it("should broadcast internal route when called with valid host", async () => {
    runInAction(() => {
      di.register(getInjectable({
        id: "some-id",
        instantiate: () => ({
          path: "/",
          handler: noop,
        }),
        injectionToken: internalDeepLinkingRouteInjectionToken,
      }));
    });

    try {
      expect(await lpr.route("lens://app")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://app",
      previous: "matched",
      target: "internal",
    });
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
    enabledExtensions.add(extId);

    try {
      expect(await lpr.route("lens://extension/@mirantis/minikube")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://extension/@mirantis/minikube",
      previous: "matched",
      target: "external",
    });
  });

  it("should call handler if matches", async () => {
    let called = false;

    runInAction(() => {
      di.register(getInjectable({
        id: "some-id",
        instantiate: () => ({
          path: "/page",
          handler: () => { called = true; },
        }),
        injectionToken: internalDeepLinkingRouteInjectionToken,
      }));
    });

    try {
      expect(await lpr.route("lens://app/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(true);

    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://app/page",
      previous: "matched",
      target: "internal",
    });
  });

  it("should call most exact handler", async () => {
    let called: any = 0;

    runInAction(() => {
      di.register(getInjectable({
        id: "some-id",
        instantiate: () => ({
          path: "/page",
          handler: () => { called = 1; },
        }),
        injectionToken: internalDeepLinkingRouteInjectionToken,
      }));
      di.register(getInjectable({
        id: "some-other-id",
        instantiate: () => ({
          path: "/page/:id",
          handler: params => { called = params.pathname.id; },
        } as InternalRouteRegistration),
        injectionToken: internalDeepLinkingRouteInjectionToken,
      }));
    });

    try {
      expect(await lpr.route("lens://app/page/foo")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe("foo");
    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://app/page/foo",
      previous: "matched",
      target: "internal",
    });
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
    enabledExtensions.add(extId);

    try {
      expect(await lpr.route("lens://extension/@foobar/icecream/page/foob")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe("foob");
    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://extension/@foobar/icecream/page/foob",
      previous: "matched",
      target: "external",
    });
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
      enabledExtensions.add(extId);
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
      enabledExtensions.add(extId);
    }

    enabledExtensions.add("@foobar/icecream");
    enabledExtensions.add("icecream");

    try {
      expect(await lpr.route("lens://extension/icecream/page")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }


    expect(called).toBe(1);
    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://extension/icecream/page",
      previous: "matched",
      target: "external",
    });
  });

  it("should throw if urlSchema is invalid", () => {
    expect(() => {
      runInAction(() => {
        di.register(getInjectable({
          id: "some-id",
          instantiate: () => ({
            path: "/:@",
            handler: noop,
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }));
      });
    }).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", async () => {
    let called: any = 0;

    runInAction(() => {
      di.register(
        getInjectable({
          id: "some-id-2",
          instantiate: () => ({
            path: "/",
            handler: () => { called = 2; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
        getInjectable({
          id: "some-id-1",
          instantiate: () => ({
            path: "/page",
            handler: () => { called = 1; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
        getInjectable({
          id: "some-id-3",
          instantiate: () => ({
            path: "/page/foo",
            handler: () => { called = 3; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
        getInjectable({
          id: "some-id-4",
          instantiate: () => ({
            path: "/page/bar",
            handler: () => { called = 4; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
      );
    });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(3);
    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://app/page/foo/bar/bat",
      previous: "matched",
      target: "internal",
    });
  });

  it("should call most exact handler with 2 found handlers", async () => {
    let called: any = 0;

    runInAction(() => {
      di.register(
        getInjectable({
          id: "some-id-2",
          instantiate: () => ({
            path: "/",
            handler: () => { called = 2; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
        getInjectable({
          id: "some-id-1",
          instantiate: () => ({
            path: "/page",
            handler: () => { called = 1; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
        getInjectable({
          id: "some-id-4",
          instantiate: () => ({
            path: "/page/bar",
            handler: () => { called = 4; },
          }),
          injectionToken: internalDeepLinkingRouteInjectionToken,
        }),
      );
    });

    try {
      expect(await lpr.route("lens://app/page/foo/bar/bat")).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(1);
    expect(sendDeepLinkingAttemptMock).toHaveBeenCalledWith({
      url: "lens://app/page/foo/bar/bat",
      previous: "matched",
      target: "internal",
    });
  });
});
