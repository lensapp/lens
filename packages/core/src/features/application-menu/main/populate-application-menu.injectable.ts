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
import { checkThatAllDiscriminablesAreExhausted } from "../../../common/utils/composable-responsibilities/discriminable/discriminable";

const populateApplicationMenuInjectable = getInjectable({
  id: "populate-application-menu",

  instantiate:
    () => (composite: Composite<ApplicationMenuItemTypes | MenuItemRoot>) => {
      const electronTemplate = getApplicationMenuTemplate(composite);
      const menu = Menu.buildFromTemplate(electronTemplate);

      Menu.setApplicationMenu(menu);
    },

  causesSideEffects: true,
});

export default populateApplicationMenuInjectable;

export const getApplicationMenuTemplate = (composite: Composite<ApplicationMenuItemTypes | MenuItemRoot>) => {
  const topLevelMenus = composite.children.filter(
    (x): x is Composite<ApplicationMenuItemTypes> => x.value.kind !== "root",
  );

  return topLevelMenus.map(toHierarchicalElectronMenuItem);
};

const toHierarchicalElectronMenuItem = (
  composite: Composite<ApplicationMenuItemTypes>,
): MenuItemOpts => {
  const value = composite.value;

  switch (value.kind) {
    case "top-level-menu": {
      const { id } = composite;
      const { label, role } = value;

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
      const { id } = composite;
      const { label } = value;

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
      const { id } = composite;
      const { label, onClick, keyboardShortcut } = value;

      return {
        ...(id ? { id } : {}),
        ...(label ? { label } : {}),
        ...(keyboardShortcut ? { accelerator: keyboardShortcut }: {}),
        click: onClick,
      };
    }

    case "os-action-menu-item": {
      const { label, keyboardShortcut, actionName } = value;

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
      throw checkThatAllDiscriminablesAreExhausted(value);
    }
  }
};
