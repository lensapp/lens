/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { noop } from "lodash/fp";
import { runInAction } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import applicationMenuItemInjectionToken from "./main/menu-items/application-menu-item-injection-token";
import logErrorInjectable from "../../common/log-error.injectable";

describe("application-menu-in-legacy-extension-api", () => {
  let builder: ApplicationBuilder;
  let logErrorMock: jest.Mock;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      runInAction(() => {
        mainDi.register(
          someTopMenuItemInjectable,
          someNonExtensionBasedMenuItemInjectable,
        );
      });

      logErrorMock = jest.fn();

      mainDi.override(logErrorInjectable, () => logErrorMock);
    });

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
              id: "some-non-shown-item",
              parentId: "some-top-menu-item",
              click: noop,
              label: "Irrelevant",
              visible: false,
            },

            {
              id: "some-clickable-item",
              parentId: "some-top-menu-item",
              click: onClickMock,
            },

            {
              parentId: "some-top-menu-item",
              type: "separator",
            },

            {
              id: "some-os-action-menu-item-id",
              parentId: "some-top-menu-item",
              role: "help",
            },

            {
              id: "some-submenu-with-explicit-children",
              parentId: "some-top-menu-item",

              submenu: [
                { id: "some-explicit-child", label: "Some explicit child", click: noop },
              ],
            },
          ],
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("related menu items exist", () => {
      const menuItemPathsForExtension = builder.applicationMenu.items.filter(
        (x) =>
          x.join(".").startsWith("root.some-top-menu-item.some-extension-name"),
      );

      expect(menuItemPathsForExtension).toEqual([
        ["root", "some-top-menu-item", "some-extension-name/some-clickable-item"],
        // Note: anonymous index "1" is used by the non-visible menu item.
        ["root", "some-top-menu-item", "some-extension-name/2-separator"],
        ["root", "some-top-menu-item", "some-extension-name/some-os-action-menu-item-id"],
        ["root", "some-top-menu-item", "some-extension-name/some-submenu-with-explicit-children"],
        ["root", "some-top-menu-item", "some-extension-name/some-submenu-with-explicit-children", "some-extension-name/some-submenu-with-explicit-children/some-explicit-child"],
      ]);
    });

    it("when the extension-based clickable menu item is clicked, does so", () => {
      builder.applicationMenu.click(
        "root", "some-top-menu-item", "some-extension-name/some-clickable-item",
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
            x.join(".").startsWith("root.some-top-menu-item.some-extension-name"),
        );

        expect(menuItemPathsForExtension).toEqual([]);
      });

      it("when the extension is enabled again, also related menu items exist again", () => {
        builder.extensions.enable(testExtensionOptions);

        const menuItemPathsForExtension = builder.applicationMenu.items.filter(
          (x) =>
            x.join(".").startsWith("root.some-top-menu-item.some-extension-name"),
        );

        expect(menuItemPathsForExtension).toEqual([
          ["root", "some-top-menu-item", "some-extension-name/some-clickable-item"],
          ["root", "some-top-menu-item", "some-extension-name/2-separator"],
          ["root", "some-top-menu-item", "some-extension-name/some-os-action-menu-item-id"],
          ["root", "some-top-menu-item", "some-extension-name/some-submenu-with-explicit-children"],
          ["root", "some-top-menu-item", "some-extension-name/some-submenu-with-explicit-children", "some-extension-name/some-submenu-with-explicit-children/some-explicit-child"],
        ]);
      });
    });
  });

  describe("when extension with unrecognizable application menu items is enabled", () => {

    beforeEach(() => {
      const testExtensionOptions: FakeExtensionOptions = {
        id: "some-test-extension",
        name: "some-extension-name",

        mainOptions: {
          appMenus: [
            {
              id: "some-recognizable-item",
              parentId: "some-top-menu-item",
              click: noop,
            },

            {
              id: "some-unrecognizable-item",
              parentId: "some-top-menu-item",
              // Note: there is no way to recognize this
              // click: noop,
              // role: "help"
              // submenu: []
              // type: "separator"
            },
          ],
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("only recognizable menu items from extension exist", () => {
      const menuItemPathsForExtension = builder.applicationMenu.items.filter(
        (x) =>
          x.join(".").startsWith("root.some-top-menu-item.some-extension-name"),
      );

      expect(menuItemPathsForExtension).toEqual([
        ["root", "some-top-menu-item", "some-extension-name/some-recognizable-item"],
      ]);
    });

    it("logs about the unrecognizable item", () => {
      expect(logErrorMock).toHaveBeenCalledWith(
        '[MENU]: Tried to register menu item "some-extension-name/some-unrecognizable-item" but it is not recognizable as any of ApplicationMenuItemTypes',
      );
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
