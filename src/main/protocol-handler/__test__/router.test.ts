import { LensProtocolRouterMain } from "../router";
import Url from "url-parse";
import { noop } from "../../../common/utils";
import { extensionsStore } from "../../../extensions/extensions-store";

function throwIfDefined(val: any): void {
  if (val != null) {
    throw val;
  }
}

describe("protocol router tests", () => {
  let lpr: LensProtocolRouterMain;

  beforeEach(() => {
    (extensionsStore as any).state.clear();
    LensProtocolRouterMain.resetInstance();
    lpr = LensProtocolRouterMain.getInstance<LensProtocolRouterMain>();
  });

  it("should throw on non-lens URLS", async () => {
    try {
      expect(await lpr.route(Url("https://google.ca"))).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should throw when host not internal or extension", async () => {
    try {
      expect(await lpr.route(Url("lens://foobar"))).toBeUndefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should not throw when has valid host", async () => {
    (extensionsStore as any).state.set("@mirantis/minikube", { enabled: true, name: "@mirantis/minikube" });
    lpr.on("/", noop);
    lpr.extensionOn("@mirantis/minikube", "/", noop);

    try {
      expect(await lpr.route(Url("lens://internal"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    try {
      expect(await lpr.route(Url("lens://extension/@mirantis/minikube"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }
  });

  it("should call handler if matches", async () => {
    let called = false;

    lpr.on("/page", () => { called = true; });

    try {
      expect(await lpr.route(Url("lens://internal/page"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    expect(called).toBe(true);
  });

  it("should call most exact handler", async () => {
    let called: any = 0;

    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/:id", params => { called = params.pathname.id; });

    try {
      expect(await lpr.route(Url("lens://internal/page/foo"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    expect(called).toBe("foo");
  });

  it("should call most exact handler for an extension", async () => {
    (extensionsStore as any).state.set("@foobar/icecream", { enabled: true, name: "@foobar/icecream" });
    let called: any = 0;

    lpr.extensionOn("@foobar/icecream", "/page", () => { called = 1; });
    lpr.extensionOn("@foobar/icecream", "/page/:id", params => { called = params.pathname.id; });

    try {
      expect(await lpr.route(Url("lens://extension/@foobar/icecream/page/foob"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    expect(called).toBe("foob");
  });

  it("should work with non-org extensions", async () => {
    (extensionsStore as any).state.set("@foobar/icecream", { enabled: true, name: "@foobar/icecream" });
    (extensionsStore as any).state.set("icecream", { enabled: true, name: "icecream" });
    let called: any = 0;

    lpr.extensionOn("icecream", "/page", () => { called = 1; });
    lpr.extensionOn("@foobar/icecream", "/page/:id", params => { called = params.pathname.id; });

    try {
      expect(await lpr.route(Url("lens://extension/icecream/page"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();
    }

    expect(called).toBe(1);
  });

  it("should throw if urlSchema is invalid", () => {
    expect(() => lpr.on("/:@", noop)).toThrowError();
    expect(() => lpr.extensionOn("@foobar/icecream", "/page/:@", noop)).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", async () => {
    let called: any = 0;

    lpr.on("/", () => { called = 2; });
    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/foo", () => { called = 3; });
    lpr.on("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route(Url("lens://internal/page/foo/bar/bat"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    expect(called).toBe(3);
  });

  it("should call most exact handler with 2 found handlers", async () => {
    let called: any = 0;

    lpr.on("/", () => { called = 2; });
    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/bar", () => { called = 4; });

    try {
      expect(await lpr.route(Url("lens://internal/page/foo/bar/bat"))).toBeUndefined();
    } catch (error) {
      expect(throwIfDefined(error)).not.toThrow();

    }

    expect(called).toBe(1);
  });
});
