/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { flatMap, kebabCase } from "lodash/fp";
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
import type { TrayMenuItem } from "./tray-menu-item-injection-token";
import { trayMenuItemInjectionToken } from "./tray-menu-item-injection-token";
import type { TrayMenuRegistration } from "../tray-menu-registration";

const trayMenuItemRegistratorInjectable = getInjectable({
  id: "tray-menu-item-registrator",

  instantiate: (di) => (extension: LensMainExtension, installationCounter) => {
    pipeline(
      extension.trayMenus,

      flatMap(toItemInjectablesFor(extension, installationCounter)),

      (injectables) => di.register(...injectables),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default trayMenuItemRegistratorInjectable;


const toItemInjectablesFor = (extension: LensMainExtension, installationCounter: number) => {
  const _toItemInjectables = (parentId: string | null) => (registration: TrayMenuRegistration): Injectable<TrayMenuItem, TrayMenuItem, void>[] => {
    const trayItemId = registration.id || kebabCase(registration.label);
    const id = `${trayItemId}-tray-menu-item-for-extension-${extension.sanitizedExtensionId}-instance-${installationCounter}`;

    const parentInjectable = getInjectable({
      id,

      instantiate: () => ({
        id,
        parentId,
        orderNumber: 100,

        separator: registration.type === "separator",

        label: registration.label,
        tooltip: registration.toolTip,

        click: () => {
          registration.click?.(registration);
        },

        enabled: computed(() => registration.enabled),
        visible: computed(() => true),
      }),

      injectionToken: trayMenuItemInjectionToken,
    });

    const childMenuItems = registration.submenu || [];

    const childInjectables = childMenuItems.flatMap(_toItemInjectables(id));

    return [
      parentInjectable,
      ...childInjectables,
    ];
  };

  return _toItemInjectables(null);
};


