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
import { routeInjectionToken } from "../../common/front-end-routing/route-injection-token";
import { computed } from "mobx";
import type { UserStore } from "../../common/user-store";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import type { ThemeStore } from "../../renderer/themes/store";
import themeStoreInjectable from "../../renderer/themes/store.injectable";
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
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi }) => {
      rendererDi.register(testPreferencesRouteInjectable);
      rendererDi.register(testPreferencesRouteComponentInjectable);
      rendererDi.register(testFrontPageRouteInjectable);
      rendererDi.register(testFrontPageRouteComponentInjectable);
      rendererDi.register(testNavigationItemInjectable);

      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
      } as unknown as UserStore;

      rendererDi.override(userStoreInjectable, () => userStoreStub);

      const themeStoreStub = { themeOptions: [] } as unknown as ThemeStore;

      rendererDi.override(themeStoreInjectable, () => themeStoreStub);

      rendererDi.override(navigateToFrontPageInjectable, (di) => {
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
    let rendererDi: DiContainer;

    beforeEach(async () => {
      applicationBuilder.beforeSetups(({ rendererDi }) => {
        rendererDi.override(observableHistoryInjectable, () => {
          const historyFake = createMemoryHistory({
            initialEntries: ["/some-test-path"],
            initialIndex: 0,
          });

          return createObservableHistory(historyFake, {
            searchParams: searchParamsOptions,
          });
        });
      });

      rendered = await applicationBuilder.render();
      rendererDi = applicationBuilder.dis.rendererDi;

      applicationBuilder.preferences.navigate();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    describe("when preferences are closed", () => {
      beforeEach(() => {
        applicationBuilder.preferences.close();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("navigates back to the original page", () => {
        const currentPath = rendererDi.inject(currentPathInjectable).get();

        expect(currentPath).toBe("/some-test-path");
      });
    });

    describe("when navigating to a tab in preferences", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click(
          "some-test-preference-navigation-item-id",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      describe("when preferences are closed", () => {
        beforeEach(() => {
          applicationBuilder.preferences.close();
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("navigates back to the original page", () => {
          const currentPath = rendererDi.inject(currentPathInjectable).get();

          expect(currentPath).toBe("/some-test-path");
        });
      });
    });
  });

  describe("given accessing preferences directly", () => {
    let rendered: RenderResult;
    let rendererDi: DiContainer;

    beforeEach(async () => {
      applicationBuilder.beforeSetups(({ rendererDi }) => {
        rendererDi.override(observableHistoryInjectable, () => {
          const historyFake = createMemoryHistory({
            initialEntries: ["/preferences/app"],
            initialIndex: 0,
          });

          return createObservableHistory(historyFake, {
            searchParams: searchParamsOptions,
          });
        });
      });

      rendered = await applicationBuilder.render();

      rendererDi = applicationBuilder.dis.rendererDi;
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    describe("when preferences are closed", () => {
      beforeEach(() => {
        applicationBuilder.preferences.close();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("navigates back to the front page", () => {
        const currentPath = rendererDi.inject(currentPathInjectable).get();

        expect(currentPath).toBe("/some-front-page");
      });
    });

    describe("when navigating to a tab in preferences", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click(
          "some-test-preference-navigation-item-id",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      describe("when preferences are closed", () => {
        beforeEach(() => {
          applicationBuilder.preferences.close();
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("navigates back to the front page", () => {
          const currentPath = rendererDi.inject(currentPathInjectable).get();

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

  injectionToken: routeInjectionToken,
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

  injectionToken: routeInjectionToken,
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
      isActive: routeIsActive,
      isVisible: testRoute.isEnabled,
      navigate: navigateToPreferenceTab(testRoute),
      orderNumber: 100,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});
