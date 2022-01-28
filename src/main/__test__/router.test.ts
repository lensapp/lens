/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Router } from "../router/router";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

describe("Router", () => {
  it("blocks path traversal attacks", async () => {
    const response: any = {
      statusCode: 200,
      end: jest.fn(),
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
      end: jest.fn(),
    };
    const req: any = {
      url: "",
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
