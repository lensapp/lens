/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { computed, runInAction } from "mobx";
import { noop } from "lodash/fp";
import routeIsActiveInjectable from "../../renderer/routes/route-is-active.injectable";
import { frontEndRouteInjectionToken } from "../../common/front-end-routing/front-end-route-injection-token";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import storageSaveDelayInjectable from "../../renderer/utils/create-storage/storage-save-delay.injectable";
import { flushPromises } from "@k8slens/test-utils";
import { testUsingFakeTime, advanceFakeTime } from "../../test-utils/use-fake-time";

describe("cluster - sidebar and tab navigation for core", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(() => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(storageSaveDelayInjectable, () => 250);
    });
  });

  describe("given core registrations", () => {
    beforeEach(() => {
      builder.beforeWindowStart(({ windowDi }) => {
        runInAction(() => {
          windowDi.register(
            testRouteInjectable,
            testRouteComponentInjectable,
            someParentSidebarItemInjectable,
            someChildSidebarItemInjectable,
          );
        });
      });
    });

    describe("given no state for expanded sidebar items exists, and navigated to child sidebar item, when rendered", () => {
      beforeEach(async () => {
        rendered = await builder.render();

        const windowDi = builder.applicationWindow.only.di;

        const route = windowDi.inject(testRouteInjectable);
        const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);

        navigateToRoute(route);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent is highlighted", () => {
        const parent = rendered.queryByTestId("sidebar-item-some-parent");

        expect(parent?.dataset.isActiveTest).toBe("true");
      });

      it("parent sidebar item is not expanded", () => {
        const child = rendered.queryByTestId("sidebar-item-some-child");

        expect(child).toBeNull();
      });

      it("child page is shown", () => {
        expect(rendered.getByTestId("some-child-page")).not.toBeNull();
      });
    });

    describe("given state for expanded sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        builder.beforeWindowStart(async ({ windowDi }) => {
          const writeJsonFile = windowDi.inject(writeJsonFileInjectable);

          await writeJsonFile(
            "/some-directory-for-app-data/some-product-name/lens-local-storage/some-cluster-id.json",
            {
              sidebar: {
                expanded: { "sidebar-item-some-parent": true },
                width: 200,
              },
            },
          );
        });

        rendered = await builder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not highlighted", () => {
        const parent = rendered.queryByTestId("sidebar-item-some-parent");

        expect(parent?.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is expanded", () => {
        const child = rendered.queryByTestId("sidebar-item-some-child");

        expect(child).not.toBeNull();
      });
    });

    describe("given state for expanded unknown sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        builder.beforeWindowStart(async ({ windowDi }) => {
          const writeJsonFileFake = windowDi.inject(writeJsonFileInjectable);

          await writeJsonFileFake(
            "/some-directory-for-app-data/some-product-name/lens-local-storage/some-hosted-cluster-id.json",
            {
              sidebar: {
                expanded: { "some-unknown-parent-id": true },
                width: 200,
              },
            },
          );
        });

        rendered = await builder.render();
      });

      it("renders without errors", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not expanded", () => {
        const child = rendered.queryByTestId("sidebar-item-some-child");

        expect(child).toBeNull();
      });
    });

    describe("given empty state for expanded sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        builder.beforeWindowStart(async ({ windowDi }) => {
          const writeJsonFileFake = windowDi.inject(writeJsonFileInjectable);

          await writeJsonFileFake(
            "/some-directory-for-app-data/some-product-name/lens-local-storage/some-hosted-cluster-id.json",
            {
              someThingButSidebar: {},
            },
          );
        });

        rendered = await builder.render();
      });

      it("renders without errors", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not expanded", () => {
        const child = rendered.queryByTestId("sidebar-item-some-child");

        expect(child).toBeNull();
      });
    });

    describe("given no initially persisted state for sidebar items, when rendered", () => {
      let windowDi: DiContainer;

      beforeEach(async () => {
        rendered = await builder.render();

        windowDi = builder.applicationWindow.only.di;
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not highlighted", () => {
        const parent = rendered.queryByTestId("sidebar-item-some-parent");

        expect(parent?.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is not expanded", () => {
        const child = rendered.queryByTestId("sidebar-item-some-child");

        expect(child).toBeNull();
      });

      describe("when a parent sidebar item is expanded", () => {
        beforeEach(() => {
          const parentLink = rendered.getByTestId(
            "link-for-sidebar-item-some-parent",
          );

          fireEvent.click(parentLink);
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("parent sidebar item is not highlighted", () => {
          const parent = rendered.queryByTestId("sidebar-item-some-parent");

          expect(parent?.dataset.isActiveTest).toBe("false");
        });

        it("parent sidebar item is expanded", () => {
          const child = rendered.queryByTestId("sidebar-item-some-child");

          expect(child).not.toBeNull();
        });

        describe("when a child of the parent is selected", () => {
          beforeEach(() => {
            const childLink = rendered.getByTestId(
              "link-for-sidebar-item-some-child",
            );

            fireEvent.click(childLink);
          });

          it("renders", () => {
            expect(rendered.container).toMatchSnapshot();
          });

          it("parent is highlighted", () => {
            const parent = rendered.queryByTestId("sidebar-item-some-parent");

            expect(parent?.dataset.isActiveTest).toBe("true");
          });

          it("child is highlighted", () => {
            const child = rendered.queryByTestId("sidebar-item-some-child");

            expect(child?.dataset.isActiveTest).toBe("true");
          });

          it("child page is shown", () => {
            expect(rendered.getByTestId("some-child-page")).not.toBeNull();
          });

          it("when not enough time passes, does not store state for expanded sidebar items to file system yet", async () => {
            advanceFakeTime(250 - 1);

            const pathExistsFake = windowDi.inject(pathExistsInjectable);

            const actual = await pathExistsFake(
              "/some-directory-for-app-data/some-product-name/lens-local-storage/some-hosted-cluster-id.json",
            );

            expect(actual).toBe(false);
          });

          it("when enough time passes, stores state for expanded sidebar items to file system", async () => {
            advanceFakeTime(250);

            const readJsonFileFake = windowDi.inject(readJsonFileInjectable);

            await flushPromises();

            const actual = await readJsonFileFake(
              "/some-directory-for-app-data/some-product-name/lens-local-storage/some-cluster-id.json",
            );

            expect(actual).toEqual({
              sidebar: {
                expanded: { "sidebar-item-some-parent": true },
                width: 200,
              },
            });
          });
        });
      });
    });
  });
});

const someParentSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-parent",
  instantiate: () => ({
    parentId: null,
    title: "Some parent",
    onClick: noop,
    getIcon: () => <div data-testid="some-icon-for-parent" />,
    orderNumber: 42,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someChildSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-child",
  instantiate: (di) => {
    const route = di.inject(testRouteInjectable);
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return {
      parentId: someParentSidebarItemInjectable.id,
      title: "Some child",
      onClick: () => navigateToRoute(route),
      isActive: routeIsActive,
      orderNumber: 168,
    };
  },
  injectionToken: sidebarItemInjectionToken,
});

const testRouteInjectable = getInjectable({
  id: "some-route-injectable-id",

  instantiate: () => ({
    path: "/some-child-page",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

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
