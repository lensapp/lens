/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { computed } from "mobx";
import type { RenderResult } from "@testing-library/react";
import { routeSpecificComponentInjectionToken } from "../renderer/routes/route-specific-component-injection-token";
import { observer } from "mobx-react";
import type { Route } from "../common/front-end-routing/route-injection-token";
import { routeInjectionToken } from "../common/front-end-routing/route-injection-token";
import type { ApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import currentRouteInjectable from "../renderer/routes/current-route.injectable";
import currentPathInjectable from "../renderer/routes/current-path.injectable";
import queryParametersInjectable from "../renderer/routes/query-parameters.injectable";
import currentPathParametersInjectable from "../renderer/routes/current-path-parameters.injectable";
import { navigateToRouteInjectionToken } from "../common/front-end-routing/navigate-to-route-injection-token";

describe("navigating between routes", () => {
  let rendererDi: DiContainer;
  let rendered: RenderResult;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();
    rendererDi = applicationBuilder.dis.rendererDi;
  });

  describe("given route without path parameters", () => {
    beforeEach(async () => {
      applicationBuilder.beforeSetups(({ rendererDi }) => {
        rendererDi.register(testRouteWithoutPathParametersInjectable);
        rendererDi.register(testRouteWithoutPathParametersComponentInjectable);
      });

      rendered = await applicationBuilder.render();
    });

    describe("when navigating to route", () => {
      let route: Route;

      beforeEach(() => {
        const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);

        route = rendererDi.inject(testRouteWithoutPathParametersInjectable);

        navigateToRoute(route);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("knows current route", () => {
        const currentRoute = rendererDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = rendererDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe("/some-path");
      });

      it("does not have query parameters", () => {
        const queryParameters = rendererDi.inject(queryParametersInjectable);

        expect(queryParameters.get()).toEqual({});
      });

      it("does not have path parameters", () => {
        const pathParameters = rendererDi.inject(currentPathParametersInjectable);

        expect(pathParameters.get()).toEqual({});
      });
    });

    it("when navigating to route with query parameters, knows query parameters", () => {
      const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);
      const queryParameters = rendererDi.inject(queryParametersInjectable);

      const route = rendererDi.inject(testRouteWithoutPathParametersInjectable);

      navigateToRoute(route, {
        query: {
          someParameter: "some-value",
          someOtherParameter: "some-other-value",
        },
      });

      expect(queryParameters.get()).toEqual({
        someParameter: "some-value",
        someOtherParameter: "some-other-value",
      });
    });
  });

  describe("given route with optional path parameters", () => {
    beforeEach(async () => {

      applicationBuilder.beforeSetups(({ rendererDi }) => {
        rendererDi.register(routeWithOptionalPathParametersInjectable);
        rendererDi.register(routeWithOptionalPathParametersComponentInjectable);
      });


      rendered = await applicationBuilder.render();
    });

    describe("when navigating to route with path parameters", () => {
      let route: Route<any>;

      beforeEach(() => {
        route = rendererDi.inject(routeWithOptionalPathParametersInjectable);

        const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);

        navigateToRoute(route, {
          parameters: {
            someParameter: "some-value",
            someOtherParameter: "some-other-value",
          },
        });
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("knows current route", () => {
        const currentRoute = rendererDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = rendererDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe(
          "/some-path/some-value/some-other-value",
        );
      });

      it("knows path parameters", () => {
        const pathParameters = rendererDi.inject(currentPathParametersInjectable);

        expect(pathParameters.get()).toEqual({
          someParameter: "some-value",
          someOtherParameter: "some-other-value",
        });
      });
    });

    describe("when navigating to route without path parameters", () => {
      let route: Route<any>;

      beforeEach(() => {
        route = rendererDi.inject(routeWithOptionalPathParametersInjectable);

        const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);

        navigateToRoute(route);
      });

      it("knows current route", () => {
        const currentRoute = rendererDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = rendererDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe("/some-path");
      });

      it("knows path parameters", () => {
        const pathParameters = rendererDi.inject(currentPathParametersInjectable);

        expect(pathParameters.get()).toEqual({
          someParameter: undefined,
          someOtherParameter: undefined,
        });
      });
    });
  });
});

const testRouteWithoutPathParametersInjectable = getInjectable({
  id: "some-route",
  injectionToken: routeInjectionToken,

  instantiate: () => ({
    path: "/some-path",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),
});

const testRouteWithoutPathParametersComponentInjectable = getInjectable({
  id: "some-route-component",

  instantiate: (di) => ({
    route: di.inject(testRouteWithoutPathParametersInjectable),
    Component: () => <div>Some component</div>,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const routeWithOptionalPathParametersInjectable = getInjectable({
  id: "some-route",
  injectionToken: routeInjectionToken,

  instantiate: (): Route<{ someParameter?: string; someOtherParameter?: string }> => ({
    path: "/some-path/:someParameter?/:someOtherParameter?",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),
});

const routeWithOptionalPathParametersComponentInjectable = getInjectable({
  id: "some-route-component",

  instantiate: (di) => {
    const pathParameters = di.inject(currentPathParametersInjectable);

    return {
      route: di.inject(routeWithOptionalPathParametersInjectable),

      Component: observer(() => (
        <pre>{JSON.stringify(pathParameters.get(), null, 2)}</pre>
      )),
    };
  },

  injectionToken: routeSpecificComponentInjectionToken,
});

