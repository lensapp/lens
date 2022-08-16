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
import type { Route } from "../common/front-end-routing/front-end-route-injection-token";
import { frontEndRouteInjectionToken } from "../common/front-end-routing/front-end-route-injection-token";
import type { ApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import currentRouteInjectable from "../renderer/routes/current-route.injectable";
import currentPathInjectable from "../renderer/routes/current-path.injectable";
import queryParametersInjectable from "../renderer/routes/query-parameters.injectable";
import { navigateToRouteInjectionToken } from "../common/front-end-routing/navigate-to-route-injection-token";
import routePathParametersInjectable from "../renderer/routes/route-path-parameters.injectable";

describe("navigating between routes", () => {
  let rendered: RenderResult;
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder();
  });

  describe("given route without path parameters", () => {
    let windowDi: DiContainer;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.register(testRouteWithoutPathParametersInjectable);
        windowDi.register(testRouteWithoutPathParametersComponentInjectable);
      });

      rendered = await builder.render();

      windowDi = builder.applicationWindow.only.di;
    });

    describe("when navigating to route", () => {
      let route: Route;

      beforeEach(() => {
        const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);

        route = windowDi.inject(testRouteWithoutPathParametersInjectable);

        navigateToRoute(route);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("knows current route", () => {
        const currentRoute = windowDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = windowDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe("/some-path");
      });

      it("does not have query parameters", () => {
        const queryParameters = windowDi.inject(queryParametersInjectable);

        expect(queryParameters.get()).toEqual({});
      });

      it("does not have path parameters", () => {
        const pathParameters = windowDi.inject(routePathParametersInjectable, route);

        expect(pathParameters.get()).toEqual({});
      });
    });

    it("when navigating to route with query parameters, knows query parameters", () => {
      const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);
      const queryParameters = windowDi.inject(queryParametersInjectable);

      const route = windowDi.inject(testRouteWithoutPathParametersInjectable);

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
    let windowDi: DiContainer;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.register(routeWithOptionalPathParametersInjectable);
        windowDi.register(routeWithOptionalPathParametersComponentInjectable);
      });

      rendered = await builder.render();

      windowDi = builder.applicationWindow.only.di;
    });

    describe("when navigating to route with path parameters", () => {
      let route: Route<any>;

      beforeEach(() => {
        route = windowDi.inject(routeWithOptionalPathParametersInjectable);

        const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);

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
        const currentRoute = windowDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = windowDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe(
          "/some-path/some-value/some-other-value",
        );
      });

      it("knows path parameters", () => {
        const pathParameters = windowDi.inject(routePathParametersInjectable, route);

        expect(pathParameters.get()).toEqual({
          someParameter: "some-value",
          someOtherParameter: "some-other-value",
        });
      });
    });

    describe("when navigating to route without path parameters", () => {
      let route: Route<any>;

      beforeEach(() => {
        route = windowDi.inject(routeWithOptionalPathParametersInjectable);

        const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);

        navigateToRoute(route);
      });

      it("knows current route", () => {
        const currentRoute = windowDi.inject(currentRouteInjectable);

        expect(currentRoute.get()).toBe(route);
      });

      it("knows current path", () => {
        const currentPath = windowDi.inject(currentPathInjectable);

        expect(currentPath.get()).toBe("/some-path");
      });

      it("knows path parameters", () => {
        const pathParameters = windowDi.inject(routePathParametersInjectable, route);

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
  injectionToken: frontEndRouteInjectionToken,

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
  injectionToken: frontEndRouteInjectionToken,

  instantiate: (): Route<{ someParameter?: string; someOtherParameter?: string }> => ({
    path: "/some-path/:someParameter?/:someOtherParameter?",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),
});

const routeWithOptionalPathParametersComponentInjectable = getInjectable({
  id: "some-route-component",

  instantiate: (di) => {
    const route = di.inject(routeWithOptionalPathParametersInjectable);
    const pathParameters = di.inject(routePathParametersInjectable, route);

    return {
      route,

      Component: observer(() => (
        <pre>{JSON.stringify(pathParameters.get(), null, 2)}</pre>
      )),
    };
  },

  injectionToken: routeSpecificComponentInjectionToken,
});

