/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import type { SidebarItemRegistration } from "../../renderer/components/layout/sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../renderer/components/layout/sidebar-items.injectable";
import { computed } from "mobx";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import React from "react";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { frontEndRouteInjectionToken } from "../../common/front-end-routing/front-end-route-injection-token";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";

describe("cluster - visibility of sidebar items", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart((windowDi) => {
      windowDi.register(testRouteInjectable);
      windowDi.register(testRouteComponentInjectable);
      windowDi.register(testSidebarItemsInjectable);
    });
  });

  describe("given kube resource for route is not allowed", () => {
    beforeEach(async () => {
      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("related sidebar item does not exist", () => {
      const item = rendered.queryByTestId("sidebar-item-some-item-id");

      expect(item).toBeNull();
    });

    describe("when kube resource becomes allowed", () => {
      beforeEach(() => {
        builder.allowKubeResource("namespaces");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("related sidebar item exists", () => {
        const item = rendered.queryByTestId("sidebar-item-some-item-id");

        expect(item).not.toBeNull();
      });
    });
  });
});

const testRouteInjectable = getInjectable({
  id: "some-route-injectable-id",

  instantiate: (di) => {
    const someKubeResourceName = "namespaces";

    const kubeResourceIsAllowed = di.inject(
      isAllowedResourceInjectable,
      someKubeResourceName,
    );

    return {
      path: "/some-child-page",
      isEnabled: kubeResourceIsAllowed,
      clusterFrame: true,
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

const testRouteComponentInjectable = getInjectable({
  id: "some-child-page-route-component-injectable",

  instantiate: (di) => ({
    route: di.inject(testRouteInjectable),
    Component: () => <div data-testid="some-child-page" />,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const testSidebarItemsInjectable = getInjectable({
  id: "some-sidebar-item-injectable",

  instantiate: (di) => {
    const testRoute = di.inject(testRouteInjectable);
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "some-item-id",
        parentId: null,
        title: "Some item",
        onClick: () => navigateToRoute(testRoute),
        isVisible: testRoute.isEnabled,
        orderNumber: 42,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

