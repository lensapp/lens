/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest, Route } from "../router/route";
import staticFileRouteInjectable from "../routes/files/static-file-route.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";

describe("static-file-route", () => {
  let handleStaticFileRoute: Route<Buffer, "/{path*}">;

  beforeEach(() => {
    const di = getDiForUnitTesting();

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
