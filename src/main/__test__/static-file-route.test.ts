/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest, Route } from "../router/route";
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

describe("static-file-route", () => {
  let handleStaticFileRoute: Route<Buffer, "/{path*}">;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    handleStaticFileRoute = di.inject(staticFileRouteInjectable);
  });

  it("blocks path traversal attacks", async () => {
    const request = {
      params: {
        path: "../index.ts",
      },
      raw: {},
    } as LensApiRequest<"/{path*}">;

    const result = await handleStaticFileRoute.handler(request);

    expect(result).toEqual({ statusCode: 404 });
  });

  it("serves files under static root", async () => {
    const req: any = {
      url: "",
    };

    const request = {
      params: {
        path: "router.test.ts",
      },
      raw: { req },
    } as LensApiRequest<"/{path*}">;

    const result = await handleStaticFileRoute.handler(request);

    expect(result).toEqual({ statusCode: 404 });
  });
});
