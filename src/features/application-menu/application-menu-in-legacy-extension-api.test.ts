/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import applicationMenuItemInjectionToken from "./main/menu-items/application-menu-item-injection-token";

describe("application-menu-in-legacy-extension-api", () => {
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart(
      action((mainDi) => {
        mainDi.register(
          someTopMenuItemInjectable,
          someNonExtensionBasedMenuItemInjectable,
        );
      }),
    );

    await builder.startHidden();
  });

  describe("when extension with application menu items is enabled", () => {
    let onClickMock: jest.Mock;
    let testExtensionOptions: FakeExtensionOptions;

    beforeEach(() => {
      onClickMock = jest.fn();

      testExtensionOptions = {
        id: "some-test-extension",
        name: "some-extension-name",

        mainOptions: {
          appMenus: [
            {
              id: "some-clickable-item",
              parentId: "some-top-menu-item",
              click: onClickMock,
            },

            {
              parentId: "some-top-menu-item",
              type: "separator",
            },
          ],
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("menu related items exist", () => {
      const menuItemPathsForExtension = builder.applicationMenu.items.filter(
        (x) =>
          x.startsWith("root.some-top-menu-item.some-extension-name"),
      );

      expect(menuItemPathsForExtension).toEqual([
        "root.some-top-menu-item.some-extension-name/application-menu-item/clickable-menu-item(some-clickable-item)",
        "root.some-top-menu-item.some-extension-name/application-menu-item/separator(1)",
      ]);
    });

    it("when the extension-based clickable menu item is clicked, does so", () => {
      builder.applicationMenu.click(
        "root.some-top-menu-item.some-extension-name/application-menu-item/clickable-menu-item(some-clickable-item)",
      );

      expect(onClickMock).toHaveBeenCalled();
    });

    describe("when the extension is disabled", () => {
      beforeEach(() => {
        builder.extensions.disable(testExtensionOptions);
      });

      it("when related menu items no longer exist", () => {
        const menuItemPathsForExtension = builder.applicationMenu.items.filter(
          (x) =>
            x.startsWith("root.some-top-menu-item.some-extension-name"),
        );

        expect(menuItemPathsForExtension).toEqual([]);
      });

      it("when the extension is enabled again, also related menu items exist again", () => {
        builder.extensions.enable(testExtensionOptions);

        const menuItemPathsForExtension = builder.applicationMenu.items.filter(
          (x) =>
            x.startsWith("root.some-top-menu-item.some-extension-name"),
        );

        expect(menuItemPathsForExtension).toEqual([
          "root.some-top-menu-item.some-extension-name/application-menu-item/clickable-menu-item(some-clickable-item)",
          "root.some-top-menu-item.some-extension-name/application-menu-item/separator(1)",
        ]);
      });
    });
  });
});

const someTopMenuItemInjectable = getInjectable({
  id: "some-top-menu-item",

  instantiate: () => ({
    id: "some-top-menu-item",
    parentId: "root" as const,
    kind: "top-level-menu" as const,
    label: "Some existing root menu item",
    orderNumber: 42,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

const someNonExtensionBasedMenuItemInjectable = getInjectable({
  id: "some-non-extension-based-menu-item",

  instantiate: () => ({
    id: "some-non-extension-based-menu-item",
    parentId: "some-top-menu-item",
    kind: "clickable-menu-item" as const,
    label: "Some menu item",
    onClick: () => {},
    orderNumber: 42,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});
