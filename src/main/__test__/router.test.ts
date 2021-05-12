import { Router } from "../router";

describe("Router", () => {
  it("blocks path traversal attacks", async () => {
    const response: any = {
      statusCode: 200,
      end: jest.fn()
    };

    await (Router as any).handleStaticFile({
      params: {
        path: "../index.ts",
      },
      response,
      raw: {},
    });

    expect(response.statusCode).toEqual(404);
  });

  it("serves files under static root", async () => {
    const response: any = {
      statusCode: 200,
      write: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn()
    };
    const req: any = {
      url: ""
    };

    await (Router as any).handleStaticFile({
      params: {
        path: "router.test.ts",
      },
      response,
      raw: { req },
    });

    expect(response.statusCode).toEqual(200);
  });
});
