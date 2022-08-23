/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import currentPathInjectable from "../../renderer/routes/current-path.injectable";
import { frontEndRouteInjectionToken } from "../../common/front-end-routing/front-end-route-injection-token";
import { computed } from "mobx";
import { preferenceNavigationItemInjectionToken } from "../../renderer/components/+preferences/preferences-navigation/preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../renderer/routes/route-is-active.injectable";
import { Preferences } from "../../renderer/components/+preferences";
import React from "react";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import observableHistoryInjectable from "../../renderer/navigation/observable-history.injectable";
import { searchParamsOptions } from "../../renderer/navigation";
import { createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import navigateToPreferenceTabInjectable from "../../renderer/components/+preferences/preferences-navigation/navigate-to-preference-tab.injectable";
import navigateToFrontPageInjectable from "../../common/front-end-routing/navigate-to-front-page.injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";

describe("preferences - closing-preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.beforeWindowStart((windowDi) => {
      windowDi.register(testPreferencesRouteInjectable);
      windowDi.register(testPreferencesRouteComponentInjectable);
      windowDi.register(testFrontPageRouteInjectable);
      windowDi.register(testFrontPageRouteComponentInjectable);
      windowDi.register(testNavigationItemInjectable);

      windowDi.override(navigateToFrontPageInjectable, (di) => {
        const navigateToRoute = di.inject(navigateToRouteInjectionToken);
        const testFrontPage = di.inject(testFrontPageRouteInjectable);

        return () => {
          navigateToRoute(testFrontPage);
        };
      });
    });
  });

  describe("given already in a page and then navigated to preferences", () => {
    let rendered: RenderResult;
    let windowDi: DiContainer;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(observableHistoryInjectable, () => {
          const historyFake = createMemoryHistory({
            initialEntries: ["/some-test-path"],
            initialIndex: 0,
          });

          return createObservableHistory(historyFake, {
            searchParams: searchParamsOptions,
          });
        });
      });

      rendered = await builder.render();
      windowDi = builder.applicationWindow.only.di;

      builder.preferences.navigate();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    describe("when preferences are closed", () => {
      beforeEach(() => {
        builder.preferences.close();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("navigates back to the original page", () => {
        const currentPath = windowDi.inject(currentPathInjectable).get();

        expect(currentPath).toBe("/some-test-path");
      });
    });

    describe("when navigating to a tab in preferences", () => {
      beforeEach(() => {
        builder.preferences.navigation.click(
          "some-test-preference-navigation-item-id",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      describe("when preferences are closed", () => {
        beforeEach(() => {
          builder.preferences.close();
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("navigates back to the original page", () => {
          const currentPath = windowDi.inject(currentPathInjectable).get();

          expect(currentPath).toBe("/some-test-path");
        });
      });
    });
  });

  describe("given accessing preferences directly", () => {
    let rendered: RenderResult;
    let windowDi: DiContainer;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(observableHistoryInjectable, () => {
          const historyFake = createMemoryHistory({
            initialEntries: ["/preferences/app"],
            initialIndex: 0,
          });

          return createObservableHistory(historyFake, {
            searchParams: searchParamsOptions,
          });
        });
      });

      rendered = await builder.render();

      windowDi = builder.applicationWindow.only.di;
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    describe("when preferences are closed", () => {
      beforeEach(() => {
        builder.preferences.close();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("navigates back to the front page", () => {
        const currentPath = windowDi.inject(currentPathInjectable).get();

        expect(currentPath).toBe("/some-front-page");
      });
    });

    describe("when navigating to a tab in preferences", () => {
      beforeEach(() => {
        builder.preferences.navigation.click(
          "some-test-preference-navigation-item-id",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      describe("when preferences are closed", () => {
        beforeEach(() => {
          builder.preferences.close();
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("navigates back to the front page", () => {
          const currentPath = windowDi.inject(currentPathInjectable).get();

          expect(currentPath).toBe("/some-front-page");
        });
      });
    });
  });
});

const testPreferencesRouteInjectable = getInjectable({
  id: "test-preferences-route",

  instantiate: () => ({
    path: "/some-test-path",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

const testPreferencesRouteComponentInjectable = getInjectable({
  id: "test-route-component",

  instantiate: (di) => ({
    route: di.inject(testPreferencesRouteInjectable),
    Component: () => <Preferences>Some test page</Preferences>,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const testFrontPageRouteInjectable = getInjectable({
  id: "test-front-page-route",

  instantiate: () => ({
    path: "/some-front-page",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

const testFrontPageRouteComponentInjectable = getInjectable({
  id: "test-front-page-route-component",

  instantiate: (di) => ({
    route: di.inject(testFrontPageRouteInjectable),
    Component: () => <div>Some front page</div>,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const testNavigationItemInjectable = getInjectable({
  id: "some-test-preference-navigation-item-id",

  instantiate: (di) => {
    const testRoute = di.inject(testPreferencesRouteInjectable);
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, testRoute);

    return {
      id: "some-test-preference-navigation-item-id",
      label: "Some preference navigation item",
      parent: "general",
      isActive: routeIsActive,
      isVisible: testRoute.isEnabled,
      navigate: navigateToPreferenceTab(testRoute),
      orderNumber: 100,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});
