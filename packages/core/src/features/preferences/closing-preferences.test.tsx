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
import React from "react";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import { observableHistoryInjectionToken, searchParamsOptions } from "@k8slens/routing";
import { createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import navigateToFrontPageInjectable from "../../common/front-end-routing/navigate-to-front-page.injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import { preferenceItemInjectionToken } from "./renderer/preference-items/preference-item-injection-token";

describe("preferences - closing-preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.beforeWindowStart(({ windowDi }) => {
      runInAction(() => {
        windowDi.register(
          testPreferenceTabInjectable,
          testPreferenceItemInjectable,
          testRouteInjectable,
          testRouteComponentInjectable,
          testFrontPageRouteInjectable,
          testFrontPageRouteComponentInjectable,
        );
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
      builder.beforeWindowStart(({ windowDi }) => {
        windowDi.override(observableHistoryInjectionToken, () => {
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
          "some-path-id-for-some-test-tab-id",
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
      builder.beforeWindowStart(({ windowDi }) => {
        windowDi.override(observableHistoryInjectionToken, () => {
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

      it("shows front page", () => {
        expect(rendered.getByTestId("some-front-page")).toBeInTheDocument();
      });
    });

    describe("when navigating to a tab in preferences", () => {
      beforeEach(() => {
        builder.preferences.navigation.click(
          "some-path-id-for-some-test-tab-id",
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

const testPreferenceTabInjectable = getInjectable({
  id: "test-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "some-test-tab-id",
    pathId: "some-path-id-for-some-test-tab-id",
    parentId: "general-tab-group" as const,
    testId: "some-test-id-for-some-test-tab-id",
    label: "Test tab",
    orderNumber: 90,
  }),

  injectionToken: preferenceItemInjectionToken,
});

const testPreferenceItemInjectable = getInjectable({
  id: "test-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "test-item",
    parentId: "some-test-tab-id" as const,
    Component: () => <div>irrelevant</div>,
    orderNumber: 0,
  }),

  injectionToken: preferenceItemInjectionToken,
});
