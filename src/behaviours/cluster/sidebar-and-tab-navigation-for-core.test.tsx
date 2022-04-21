/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import directoryForLensLocalStorageInjectable from "../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { routeSpecificComponentInjectionToken } from "../../renderer/routes/route-specific-component-injection-token";
import type { SidebarItemRegistration } from "../../renderer/components/layout/sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../renderer/components/layout/sidebar-items.injectable";
import { computed } from "mobx";
import { noop } from "lodash/fp";
import routeIsActiveInjectable from "../../renderer/routes/route-is-active.injectable";
import { routeInjectionToken } from "../../common/front-end-routing/route-injection-token";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import { getSidebarItem } from "../utils";
import createStoresAndApisInjectable from "../../renderer/create-stores-apis.injectable";
import sidebarStorageInjectable from "../../renderer/components/layout/sidebar-storage/sidebar-storage.injectable";

describe("cluster - sidebar and tab navigation for core", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendererDi: DiContainer;
  let rendered: RenderResult;

  beforeEach(() => {
    jest.useFakeTimers();

    applicationBuilder = getApplicationBuilder();
    rendererDi = applicationBuilder.dis.rendererDi;

    rendererDi.override(createStoresAndApisInjectable, () => true);
    applicationBuilder.setEnvironmentToClusterFrame();
    applicationBuilder.beforeSetups(({ rendererDi }) => {
      rendererDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );
    });
  });

  describe("given core registrations", () => {
    beforeEach(() => {
      applicationBuilder.beforeSetups(({ rendererDi }) => {
        rendererDi.register(testRouteInjectable);
        rendererDi.register(testRouteComponentInjectable);
        rendererDi.register(testSidebarItemsInjectable);
      });
    });

    describe("given no state for expanded sidebar items exists, and navigated to child sidebar item, when rendered", () => {
      beforeEach(async () => {
        applicationBuilder.beforeRender(({ rendererDi }) => {
          const route = rendererDi.inject(testRouteInjectable);

          const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);

          navigateToRoute(route);
        });

        rendered = await applicationBuilder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent is highlighted", () => {
        const parent = getSidebarItem(rendered, "some-parent-id");

        expect(parent?.dataset.isActiveTest).toBe("true");
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(rendered, "some-child-id");

        expect(child).toBeUndefined();
      });

      it("child page is shown", () => {
        expect(rendered.getByTestId("some-child-page")).not.toBeNull();
      });
    });

    describe("given state for expanded sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        applicationBuilder.beforeRender(async ({ rendererDi }) => {
          const writeJsonFileFake = rendererDi.inject(writeJsonFileInjectable);

          await writeJsonFileFake(
            "/some-directory-for-lens-local-storage/app.json",
            {
              sidebar: {
                expanded: { "some-parent-id": true },
                width: 200,
              },
            },
          );
        });
        applicationBuilder.beforeRender(async ({ rendererDi }) => {
          const sidebarStorage = rendererDi.inject(sidebarStorageInjectable);

          await sidebarStorage.whenReady;
        });

        rendered = await applicationBuilder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not highlighted", () => {
        const parent = getSidebarItem(rendered, "some-parent-id");

        expect(parent?.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is expanded", () => {
        const child = getSidebarItem(rendered, "some-child-id");

        expect(child).not.toBeUndefined();
      });
    });

    describe("given state for expanded unknown sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        applicationBuilder.beforeRender(async ({ rendererDi }) => {
          const writeJsonFileFake = rendererDi.inject(writeJsonFileInjectable);

          await writeJsonFileFake(
            "/some-directory-for-lens-local-storage/app.json",
            {
              sidebar: {
                expanded: { "some-unknown-parent-id": true },
                width: 200,
              },
            },
          );
        });

        rendered = await applicationBuilder.render();
      });

      it("renders without errors", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(rendered, "some-child-id");

        expect(child).toBeUndefined();
      });
    });

    describe("given empty state for expanded sidebar items already exists, when rendered", () => {
      beforeEach(async () => {
        applicationBuilder.beforeRender(async ({ rendererDi }) => {
          const writeJsonFileFake = rendererDi.inject(writeJsonFileInjectable);

          await writeJsonFileFake(
            "/some-directory-for-lens-local-storage/app.json",
            {
              someThingButSidebar: {},
            },
          );
        });

        rendered = await applicationBuilder.render();
      });

      it("renders without errors", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(rendered, "some-child-id");

        expect(child).toBeUndefined();
      });
    });

    describe("given no initially persisted state for sidebar items, when rendered", () => {
      beforeEach(async () => {
        rendered = await applicationBuilder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not highlighted", () => {
        const parent = getSidebarItem(rendered, "some-parent-id");

        expect(parent?.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(rendered, "some-child-id");

        expect(child).toBeUndefined();
      });

      describe("when a parent sidebar item is expanded", () => {
        beforeEach(() => {
          const parentLink = rendered.getByTestId(
            "sidebar-item-link-for-some-parent-id",
          );

          fireEvent.click(parentLink);
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("parent sidebar item is not highlighted", () => {
          const parent = getSidebarItem(rendered, "some-parent-id");

          expect(parent?.dataset.isActiveTest).toBe("false");
        });

        it("parent sidebar item is expanded", () => {
          const child = getSidebarItem(rendered, "some-child-id");

          expect(child).not.toBeUndefined();
        });

        describe("when a child of the parent is selected", () => {
          beforeEach(() => {
            const childLink = rendered.getByTestId(
              "sidebar-item-link-for-some-child-id",
            );

            fireEvent.click(childLink);
          });

          it("renders", () => {
            expect(rendered.container).toMatchSnapshot();
          });

          it("parent is highlighted", () => {
            const parent = getSidebarItem(rendered, "some-parent-id");

            expect(parent?.dataset.isActiveTest).toBe("true");
          });

          it("child is highlighted", () => {
            const child = getSidebarItem(rendered, "some-child-id");

            expect(child?.dataset.isActiveTest).toBe("true");
          });

          it("child page is shown", () => {
            expect(rendered.getByTestId("some-child-page")).not.toBeNull();
          });

          it("when not enough time passes, does not store state for expanded sidebar items to file system yet", async () => {
            jest.advanceTimersByTime(250 - 1);

            const pathExistsFake = rendererDi.inject(pathExistsInjectable);

            const actual = await pathExistsFake(
              "/some-directory-for-lens-local-storage/app.json",
            );

            expect(actual).toBe(false);
          });

          it("when enough time passes, stores state for expanded sidebar items to file system", async () => {
            jest.advanceTimersByTime(250);

            const readJsonFileFake = rendererDi.inject(readJsonFileInjectable);

            const actual = await readJsonFileFake(
              "/some-directory-for-lens-local-storage/app.json",
            );

            expect(actual).toEqual({
              sidebar: {
                expanded: { "some-parent-id": true },
                width: 200,
              },
            });
          });
        });
      });
    });
  });
});

const testSidebarItemsInjectable = getInjectable({
  id: "some-sidebar-items-injectable",

  instantiate: (di) => {
    const route = di.inject(testRouteInjectable);
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "some-parent-id",
        parentId: null,
        title: "Some parent",
        onClick: noop,
        getIcon: () => <div data-testid="some-icon-for-parent" />,
        orderNumber: 42,
      },

      {
        id: "some-child-id",
        parentId: "some-parent-id",
        title: "Some child",
        onClick: () => navigateToRoute(route),
        isActive: routeIsActive,
        orderNumber: 42,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

const  testRouteInjectable = getInjectable({
  id: "some-route-injectable-id",

  instantiate: () => ({
    path: "/some-child-page",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

  injectionToken: routeInjectionToken,
});

const testRouteComponentInjectable = getInjectable({
  id: "some-child-page-route-component-injectable",

  instantiate: (di) => ({
    route: di.inject(testRouteInjectable),
    Component: () => <div data-testid="some-child-page" />,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});
