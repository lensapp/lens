/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import type { MenuItemOpts } from "./application-menu-items.injectable";
import type { Composite } from "../../../common/utils/composite/get-composite/get-composite";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { map, sortBy } from "lodash/fp";
import type { MenuItemRoot } from "./application-menu-item-composite.injectable";

const populateApplicationMenuInjectable = getInjectable({
  id: "populate-application-menu",

  instantiate: () => (composite: Composite<ApplicationMenuItemTypes | MenuItemRoot>) => {
    const topLevelMenus = composite.children.filter(
      (x): x is Composite<ApplicationMenuItemTypes> => x.value.kind !== "root",
    );

    const electronTemplate = topLevelMenus.map(toHierarchicalElectronMenuItem);

    Menu.setApplicationMenu(Menu.buildFromTemplate(electronTemplate));
  },

  causesSideEffects: true,
});

export default populateApplicationMenuInjectable;

const toHierarchicalElectronMenuItem = (
  composite: Composite<ApplicationMenuItemTypes>,
): MenuItemOpts => {
  switch (composite.value.kind) {
    case "top-level-menu": {
      const {
        id,
        value: { label, role },
      } = composite;

      return {
        ...(id ? { id } : {}),
        ...(role ? { role } : {}),
        label,

        submenu: pipeline(
          composite.children,
          sortBy((childComposite) => childComposite.value.orderNumber),
          map(toHierarchicalElectronMenuItem),
        ),
      };
    }

    case "sub-menu": {
      const {
        id,
        value: { label },
      } = composite;

      return {
        ...(id ? { id } : {}),
        label,

        submenu: pipeline(
          composite.children,
          sortBy((childComposite) => childComposite.value.orderNumber),
          map(toHierarchicalElectronMenuItem),
        ),
      };
    }

    case "clickable-menu-item": {
      const {
        id,
        value: { label, onClick, keyboardShortcut },
      } = composite;

      return {
        ...(id ? { id } : {}),
        ...(label ? { label } : {}),
        ...(keyboardShortcut ? { accelerator: keyboardShortcut }: {}),
        click: onClick,
      };
    }

    case "os-action-menu-item": {
      const {
        value: { label, keyboardShortcut, actionName },
      } = composite;

      return {
        ...(label ? { label } : {}),
        ...(keyboardShortcut ? { accelerator: keyboardShortcut } : {}),
        role: actionName,
      };
    }

    case "separator": {
      return {
        type: "separator",
      };
    }

    default: {
      // Note: this will fail at transpilation time, if all ApplicationMenuItemTypes
      // are not handled in switch/case.
      const _exhaustiveCheck: never = composite.value;

      // Note: this code is unreachable, it is here to make ts not complain about
      // _exhaustiveCheck not being used.
      // See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      throw new Error(`Tried to create application menu, but foreign menu item was encountered: ${_exhaustiveCheck} ${composite.value}`);
    }
  }
};
