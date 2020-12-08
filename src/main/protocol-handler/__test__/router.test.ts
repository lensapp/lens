import { LensProtocolRouter } from "../router";
import Url from "url-parse";

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
    expect(() => lpr.route(Url("lens://internal"))).not.toThrowError();
    expect(() => lpr.route(Url("lens://extension"))).not.toThrowError();
  });
});
