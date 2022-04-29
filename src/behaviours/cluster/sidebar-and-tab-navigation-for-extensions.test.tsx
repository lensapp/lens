/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { getRendererExtensionFake } from "../../renderer/components/test-utils/get-renderer-extension-fake";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import routesInjectable from "../../renderer/routes/routes.injectable";
import { matches } from "lodash/fp";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import writeJsonFileInjectable from "../../common/fs/write-json-file.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";

describe("cluster - sidebar and tab navigation for extensions", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendererDi: DiContainer;
  let rendered: RenderResult;

  beforeEach(() => {
    jest.useFakeTimers();

    applicationBuilder = getApplicationBuilder();
    rendererDi = applicationBuilder.dis.rendererDi;

    applicationBuilder.setEnvironmentToClusterFrame();
  });

  describe("given extension with cluster pages and cluster page menus", () => {
    beforeEach(async () => {
      const testExtension = getRendererExtensionFake(
        extensionStubWithSidebarItems,
      );

      await applicationBuilder.addExtensions(testExtension);
    });

    describe("given no state for expanded sidebar items exists, and navigated to child sidebar item, when rendered", () => {
      beforeEach(async () => {
        applicationBuilder.beforeRender(({ rendererDi }) => {
          const navigateToRoute = rendererDi.inject(
            navigateToRouteInjectionToken,
          );

          const route = rendererDi
            .inject(routesInjectable)
            .get()
            .find(
              matches({
                path: "/extension/some-extension-id/some-child-page-id",
              }),
            );

          navigateToRoute(route);
        });

        rendered = await applicationBuilder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent is highlighted", () => {
        const parent = getSidebarItem(
          rendered,
          "some-extension-id-some-parent-id",
        );

        expect(parent.dataset.isActiveTest).toBe("true");
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(
          rendered,
          "some-extension-id-some-child-id",
        );

        expect(child).toBe(null);
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
                expanded: { "some-extension-id-some-parent-id": true },
                width: 200,
              },
            },
          );
        });

        rendered = await applicationBuilder.render();
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("parent sidebar item is not highlighted", () => {
        const parent = getSidebarItem(
          rendered,
          "some-extension-id-some-parent-id",
        );

        expect(parent.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is expanded", () => {
        const child = getSidebarItem(
          rendered,
          "some-extension-id-some-child-id",
        );

        expect(child).not.toBe(null);
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
                expanded: { "some-extension-id-some-unknown-parent-id": true },
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
        const child = getSidebarItem(
          rendered,
          "some-extension-id-some-child-id",
        );

        expect(child).toBe(null);
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
        const child = getSidebarItem(
          rendered,
          "some-extension-id-some-child-id",
        );

        expect(child).toBe(null);
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
        const parent = getSidebarItem(
          rendered,
          "some-extension-id-some-parent-id",
        );

        expect(parent.dataset.isActiveTest).toBe("false");
      });

      it("parent sidebar item is not expanded", () => {
        const child = getSidebarItem(
          rendered,
          "some-extension-id-some-child-id",
        );

        expect(child).toBe(null);
      });

      describe("when a parent sidebar item is expanded", () => {
        beforeEach(() => {
          const parentLink = rendered.getByTestId(
            "sidebar-item-link-for-some-extension-id-some-parent-id",
          );

          fireEvent.click(parentLink);
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("parent sidebar item is not highlighted", () => {
          const parent = getSidebarItem(
            rendered,
            "some-extension-id-some-parent-id",
          );

          expect(parent.dataset.isActiveTest).toBe("false");
        });

        it("parent sidebar item is expanded", () => {
          const child = getSidebarItem(
            rendered,
            "some-extension-id-some-child-id",
          );

          expect(child).not.toBe(null);
        });

        describe("when a child of the parent is selected", () => {
          beforeEach(() => {
            const childLink = rendered.getByTestId(
              "sidebar-item-link-for-some-extension-id-some-child-id",
            );

            fireEvent.click(childLink);
          });

          it("renders", () => {
            expect(rendered.container).toMatchSnapshot();
          });

          it("parent is highlighted", () => {
            const parent = getSidebarItem(
              rendered,
              "some-extension-id-some-parent-id",
            );

            expect(parent.dataset.isActiveTest).toBe("true");
          });

          it("child is highlighted", () => {
            const child = getSidebarItem(
              rendered,
              "some-extension-id-some-child-id",
            );

            expect(child.dataset.isActiveTest).toBe("true");
          });

          it("child page is shown", () => {
            expect(rendered.getByTestId("some-child-page")).not.toBeNull();
          });

          it("renders tabs", () => {
            expect(rendered.getByTestId("tab-layout")).not.toBeNull();
          });

          it("tab for child page is active", () => {
            const tabLink = rendered.getByTestId(
              "tab-link-for-some-extension-id-some-child-id",
            );

            expect(tabLink.dataset.isActiveTest).toBe("true");
          });

          it("tab for sibling page is not active", () => {
            const tabLink = rendered.getByTestId(
              "tab-link-for-some-extension-id-some-other-child-id",
            );

            expect(tabLink.dataset.isActiveTest).toBe("false");
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
                expanded: { "some-extension-id-some-parent-id": true },
                width: 200,
              },
            });
          });

          describe("when selecting sibling tab", () => {
            beforeEach(() => {
              const childTabLink = rendered.getByTestId(
                "tab-link-for-some-extension-id-some-other-child-id",
              );

              fireEvent.click(childTabLink);
            });

            it("renders", () => {
              expect(rendered.container).toMatchSnapshot();
            });

            it("sibling child page is shown", () => {
              expect(
                rendered.getByTestId("some-other-child-page"),
              ).not.toBeNull();
            });

            it("tab for sibling page is active", () => {
              const tabLink = rendered.getByTestId(
                "tab-link-for-some-extension-id-some-other-child-id",
              );

              expect(tabLink.dataset.isActiveTest).toBe("true");
            });

            it("tab for previous page is not active", () => {
              const tabLink = rendered.getByTestId(
                "tab-link-for-some-extension-id-some-child-id",
              );

              expect(tabLink.dataset.isActiveTest).toBe("false");
            });
          });
        });
      });
    });
  });
});

const extensionStubWithSidebarItems: Partial<LensRendererExtension> = {
  id: "some-extension-id",

  clusterPages: [
    {
      components: {
        Page: () => {
          throw new Error("should never come here");
        },
      },
    },

    {
      id: "some-child-page-id",

      components: {
        Page: () => <div data-testid="some-child-page">Some child page</div>,
      },
    },

    {
      id: "some-other-child-page-id",

      components: {
        Page: () => (
          <div data-testid="some-other-child-page">Some other child page</div>
        ),
      },
    },
  ],

  clusterPageMenus: [
    {
      id: "some-parent-id",
      title: "Parent",

      components: {
        Icon: () => <div>Some icon</div>,
      },
    },

    {
      id: "some-child-id",
      target: { pageId: "some-child-page-id" },
      parentId: "some-parent-id",
      title: "Child 1",

      components: {
        Icon: null,
      },
    },

    {
      id: "some-other-child-id",
      target: { pageId: "some-other-child-page-id" },
      parentId: "some-parent-id",
      title: "Child 2",

      components: {
        Icon: null,
      },
    },
  ],
};

const getSidebarItem = (rendered: RenderResult, itemId: string) =>
  rendered
    .queryAllByTestId("sidebar-item")
    .find((x) => x.dataset.idTest === itemId) || null;
