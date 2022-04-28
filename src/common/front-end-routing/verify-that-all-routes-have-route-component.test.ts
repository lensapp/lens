/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import { routeInjectionToken } from "./route-injection-token";
import { filter, map, matches } from "lodash/fp";
import clusterStoreInjectable from "../cluster/store.injectable";
import type { ClusterStore } from "../cluster/store";
import { pipeline } from "@ogre-tools/fp";

describe("verify-that-all-routes-have-component", () => {
  it("verify that routes have route component", async () => {
    const rendererDi = getDiForUnitTesting({ doGeneralOverrides: true });

    rendererDi.override(
      clusterStoreInjectable,
      () => ({ getById: (): null => null } as unknown as ClusterStore),
    );

    await rendererDi.runSetups();

    const routes = rendererDi.injectMany(routeInjectionToken);
    const routeComponents = rendererDi.injectMany(
      routeSpecificComponentInjectionToken,
    );

    const routesMissingComponent = pipeline(
      routes,

      map(
        (route) => ({
          path: route.path,
          routeComponent: routeComponents.find(matches({ route })),
        }),
      ),

      filter({ routeComponent: undefined }),

      map("path"),
    );

    expect(routesMissingComponent).toEqual([]);
  });
});
