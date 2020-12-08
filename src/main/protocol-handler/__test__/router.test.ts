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
    expect(() => lpr.route(Url("https://google.ca"))).toThrowError();
  });

  it("should throw when host not internal or extension", () => {
    expect(() => lpr.route(Url("lens://foobar"))).toThrowError();
  });

  it("should not throw when has valid host", () => {
    lpr.on("/", noop);
    lpr.extensionOn("minikube", "/", noop);

    expect(() => lpr.route(Url("lens://internal"))).not.toThrowError();
    expect(() => lpr.route(Url("lens://extension/minikube"))).not.toThrowError();
  });

  it("should call handler if matches", () => {
    let called = false;

    lpr.on("/page", () => { called = true; });
    expect(() => lpr.route(Url("lens://internal/page"))).not.toThrowError();
    expect(called).toBe(true);
  });

  it("should call most exact handler", () => {
    let called: any = 0;

    lpr.on("/page", () => { called = 1; });
    lpr.on("/page/:id", params => { called = params.pathname.id; });
    expect(() => lpr.route(Url("lens://internal/page/foo"))).not.toThrowError();
    expect(called).toBe("foo");
  });

  it("should call most exact handler for an extensions", () => {
    let called: any = 0;

    lpr.extensionOn("foobar", "/page", () => { called = 1; });
    lpr.extensionOn("foobar", "/page/:id", params => { called = params.pathname.id; });
    expect(() => lpr.route(Url("lens://extension/foobar/page/foob"))).not.toThrowError();
    expect(called).toBe("foob");
  });

  it("should throw if urlSchema is invalid", () => {
    expect(() => lpr.on("/:@", noop)).toThrowError();
    expect(() => lpr.extensionOn("foobar", "/page/:@", noop)).toThrowError();
  });
});
