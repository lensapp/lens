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
import { computed, runInAction } from "mobx";
import { preferenceNavigationItemInjectionToken } from "../../renderer/components/+preferences/preferences-navigation/preference-navigation-items.injectable";
import React from "react";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import observableHistoryInjectable from "../../renderer/navigation/observable-history.injectable";
import { searchParamsOptions } from "../../renderer/navigation";
import { createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import navigateToFrontPageInjectable from "../../common/front-end-routing/navigate-to-front-page.injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import navigateToPreferenceTabInjectable from "./renderer/preference-navigation/navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import preferenceTabIsActiveInjectable from "./renderer/preference-navigation/navigate-to-preference-tab/preference-tab-is-active.injectable";
import { preferenceItemInjectionToken } from "./renderer/preference-items/preference-item-injection-token";

describe("preferences - closing-preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.beforeWindowStart((windowDi) => {
      runInAction(() => {
        windowDi.register(testPreferenceTabInjectable);
        windowDi.register(testRouteInjectable);
        windowDi.register(testRouteComponentInjectable);
        windowDi.register(testFrontPageRouteInjectable);
        windowDi.register(testFrontPageRouteComponentInjectable);
        windowDi.register(testNavigationItemInjectable);
      });

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
            initialEntries: ["/some-page"],
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

        expect(currentPath).toBe("/some-page");
      });

      it("shows the original page", () => {
        expect(rendered.getByTestId("some-page")).toBeInTheDocument();
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

          expect(currentPath).toBe("/some-page");
        });

        it("shows the original page", () => {
          expect(rendered.getByTestId("some-page")).toBeInTheDocument();
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
            initialEntries: ["/preferences2/app"],
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

      it("shows front page", () => {
        expect(rendered.getByTestId("some-front-page")).toBeInTheDocument();
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

        it("shows front page", () => {
          expect(rendered.getByTestId("some-front-page")).toBeInTheDocument();
        });
      });
    });
  });
});

const testPreferenceTabInjectable = getInjectable({
  id: "test-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "test-tab",
    pathId: "test-tab",
    parentId: "general-tab-group" as const,
    testId: "some-test-id-for-test-tab",
    label: "Test",
    orderNumber: 90,
  }),

  injectionToken: preferenceItemInjectionToken,
});


const testFrontPageRouteInjectable = getInjectable({
  id: "some-front-page",

  instantiate: () => ({
    path: "/some-front-page",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

const testFrontPageRouteComponentInjectable = getInjectable({
  id: "some-front-page-component",

  instantiate: (di) => ({
    route: di.inject(testFrontPageRouteInjectable),
    Component: () => <div data-testid="some-front-page">Some front page</div>,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const testRouteInjectable = getInjectable({
  id: "some-page",

  instantiate: () => ({
    path: "/some-page",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

const testRouteComponentInjectable = getInjectable({
  id: "some-page-component",

  instantiate: (di) => ({
    route: di.inject(testRouteInjectable),
    Component: () => <div data-testid="some-page">Some content</div>,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

const testNavigationItemInjectable = getInjectable({
  id: "some-test-preference-navigation-item-id",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "test-tab");

    return {
      id: "some-test-preference-navigation-item-id",
      label: "Some preference navigation item",
      parent: "general",
      isActive: preferenceTabIsActive,
      isVisible: computed(() => true),
      navigate: () => navigateToPreferenceTab("test-tab"),
      orderNumber: 100,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});
