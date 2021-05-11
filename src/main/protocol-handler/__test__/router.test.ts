import * as uuid from "uuid";

import { broadcastMessage } from "../../../common/ipc";
import { ProtocolHandlerExtension, ProtocolHandlerInternal } from "../../../common/protocol-handler";
import { noop } from "../../../common/utils";
import { LensMainExtension } from "../../../extensions/core-api";
import { ExtensionLoader } from "../../../extensions/extension-loader";
import { ExtensionsStore } from "../../../extensions/extensions-store";
import { LensProtocolRouterMain } from "../router";

jest.mock("../../../common/ipc");

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  beforeEach(() => {
    ExtensionsStore.createInstance();
    ExtensionLoader.createInstance();

    const lpr = LensProtocolRouterMain.createInstance();

    lpr.extensionsLoaded = true;
    lpr.rendererLoaded = true;
  });

  afterEach(() => {
    jest.clearAllMocks();

    ExtensionsStore.resetInstance();
    ExtensionLoader.resetInstance();
    LensProtocolRouterMain.resetInstance();
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

  it.only("should not throw when has valid host", async () => {
    const extId = uuid.v4();
    const ext = new LensMainExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@mirantis/minikube",
        version: "0.1.1",
      },
      isBundled: false,
      isEnabled: true,
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

    expect(broadcastMessage).toHaveBeenNthCalledWith(1, ProtocolHandlerInternal, "lens://app/");
    expect(broadcastMessage).toHaveBeenNthCalledWith(2, ProtocolHandlerExtension, "lens://extension/@mirantis/minikube");
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
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page");
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
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo");
  });

  it("should call most exact handler for an extension", async () => {
    let called: any = 0;

    const lpr = LensProtocolRouterMain.getInstance();
    const extId = uuid.v4();
    const ext = new LensMainExtension({
      id: extId,
      manifestPath: "/foo/bar",
      manifest: {
        name: "@foobar/icecream",
        version: "0.1.1",
      },
      isBundled: false,
      isEnabled: true,
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

    expect(called).toBe("foob");
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/@foobar/icecream/page/foob");
  });

  it("should work with non-org extensions", async () => {
    const lpr = LensProtocolRouterMain.getInstance();
    let called: any = 0;

    {
      const extId = uuid.v4();
      const ext = new LensMainExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "@foobar/icecream",
          version: "0.1.1",
        },
        isBundled: false,
        isEnabled: true,
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
      const ext = new LensMainExtension({
        id: extId,
        manifestPath: "/foo/bar",
        manifest: {
          name: "icecream",
          version: "0.1.1",
        },
        isBundled: false,
        isEnabled: true,
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

    expect(called).toBe(1);
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerExtension, "lens://extension/icecream/page");
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
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat");
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
    expect(broadcastMessage).toBeCalledWith(ProtocolHandlerInternal, "lens://app/page/foo/bar/bat");
  });
});
