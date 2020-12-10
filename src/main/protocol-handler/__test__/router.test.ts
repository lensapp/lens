import { LensProtocolRouter } from "../router";
import Url from "url-parse";
import { noop } from "../../../common/utils";

describe("protocol router tests", () => {
  let lpr: LensProtocolRouter;

  beforeEach(() => {
    LensProtocolRouter.resetInstance();
    lpr = LensProtocolRouter.getInstance<LensProtocolRouter>();
  });

  it("should throw on non-lens URLS", () => {
    expect(lpr.route(Url("https://google.ca"))).rejects.toThrowError();
  });

  it("should throw when host not internal or extension", () => {
    expect(lpr.route(Url("lens://foobar"))).rejects.toThrowError();
  });

  it("should not throw when has valid host", () => {
    lpr.on("/", noop);
    lpr.extensionOn("@mirantis/minikube", "/", noop);

    expect(lpr.route(Url("lens://internal"))).resolves.toBeUndefined();
    expect(lpr.route(Url("lens://extension/@mirantis/minikube"))).resolves.toBeUndefined();
  });

  it("should call handler if matches", () => {
    let called = false;

    lpr.on("/page", () => { called = true; });
    expect(lpr.route(Url("lens://internal/page"))).resolves.toBeUndefined();
    expect(called).toBe(true);
  });

  it("should call most exact handler", () => {
    let called: any = 0;

    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/:id", params => { called = params.pathname.id; });
    expect(lpr.route(Url("lens://internal/page/foo"))).resolves.toBeUndefined();
    expect(called).toBe("foo");
  });

  it("should call most exact handler for an extensions", () => {
    let called: any = 0;

    lpr.extensionOn("@foobar/icecream", "/page", () => { called = 1; });
    lpr.extensionOn("@foobar/icecream", "/page/:id", params => { called = params.pathname.id; });
    expect(lpr.route(Url("lens://extension/@foobar/icecream/page/foob"))).resolves.toBeUndefined();
    expect(called).toBe("foob");
  });

  it("should throw if urlSchema is invalid", () => {
    expect(() => lpr.on("/:@", noop)).toThrowError();
    expect(() => lpr.extensionOn("@foobar/icecream", "/page/:@", noop)).toThrowError();
  });

  it("should call most exact handler with 3 found handlers", () => {
    let called: any = 0;

    lpr.on("/", () => { called = 2; });
    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/foo", () => { called = 3; });
    lpr.on("/page/bar", () => { called = 4; });
    expect(lpr.route(Url("lens://internal/page/foo/bar/bat"))).resolves.toBeUndefined();
    expect(called).toBe(3);
  });

  it("should call most exact handler with 2 found handlers", () => {
    let called: any = 0;

    lpr.on("/", () => { called = 2; });
    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/bar", () => { called = 4; });
    expect(lpr.route(Url("lens://internal/page/foo/bar/bat"))).resolves.toBeUndefined();
    expect(called).toBe(1);
  });
});
