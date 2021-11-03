/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { AppPaths } from "../../common/app-paths";
import { Router } from "../router";

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

AppPaths.init();

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
