/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../router";
import staticFileRouteInjectable from "../routes/static-file-route.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";

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
  let handleStaticFile: (request: LensApiRequest) => Promise<void>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    handleStaticFile = di.inject(staticFileRouteInjectable).handler;
  });

  it("blocks path traversal attacks", async () => {
    const response: any = {
      statusCode: 200,
      end: jest.fn(),
    };

    const request = {
      params: {
        path: "../index.ts",
      },
      response,
      raw: {},
    } as LensApiRequest<any>;

    await handleStaticFile(request);

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

    const request = {
      params: {
        path: "router.test.ts",
      },
      response,
      raw: { req },
    } as LensApiRequest<any>;

    await handleStaticFile(request);

    expect(response.statusCode).toEqual(200);
  });
});
