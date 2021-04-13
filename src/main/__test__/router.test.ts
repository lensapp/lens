import { Router } from "../router";

const staticRoot = __dirname;

class TestRouter extends Router {
  protected resolveStaticRootPath() {
    return staticRoot;
  }
}

describe("Router", () => {
  it("blocks path traversal attacks", async () => {
    const router = new TestRouter();
    const res = {
      statusCode: 200,
      end: jest.fn()
    };

    await router.handleStaticFile("../index.ts", res as any, {} as any, 0);

    expect(res.statusCode).toEqual(404);
  });

  it("serves files under static root", async () => {
    const router = new TestRouter();
    const res = {
      statusCode: 200,
      write: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn()
    };
    const req = {
      url: ""
    };

    await router.handleStaticFile("router.test.ts", res as any, req as any, 0);

    expect(res.statusCode).toEqual(200);
  });
});
