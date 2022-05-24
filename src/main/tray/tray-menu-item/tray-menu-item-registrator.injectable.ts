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
import { withErrorSuppression } from "../../../common/utils/with-error-suppression/with-error-suppression";
import type { WithErrorLoggingFor } from "../../../common/utils/with-error-logging/with-error-logging.injectable";
import withErrorLoggingInjectable from "../../../common/utils/with-error-logging/with-error-logging.injectable";

const trayMenuItemRegistratorInjectable = getInjectable({
  id: "tray-menu-item-registrator",

  instantiate: (di) => (extension, installationCounter) => {
    const mainExtension = extension as LensMainExtension;
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);

    pipeline(
      mainExtension.trayMenus,

      flatMap(toItemInjectablesFor(mainExtension, installationCounter, withErrorLoggingFor)),

      (injectables) => di.register(...injectables),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default trayMenuItemRegistratorInjectable;

const toItemInjectablesFor = (extension: LensMainExtension, installationCounter: number, withErrorLoggingFor: WithErrorLoggingFor) => {
  const _toItemInjectables = (parentId: string | null) => (registration: TrayMenuRegistration): Injectable<TrayMenuItem, TrayMenuItem, void>[] => {
    const trayItemId = registration.id || kebabCase(registration.label || "");
    const id = `${trayItemId}-tray-menu-item-for-extension-${extension.sanitizedExtensionId}-instance-${installationCounter}`;

    const parentInjectable = getInjectable({
      id,

      instantiate: () => ({
        id,
        parentId,
        orderNumber: 100,

        separator: registration.type === "separator",

        label: computed(() => registration.label || ""),
        tooltip: registration.toolTip,

        click: pipeline(
          () => {
            registration.click?.(registration);
          },

          withErrorLoggingFor(() => `[TRAY]: Clicking of tray item "${trayItemId}" from extension "${extension.sanitizedExtensionId}" failed.`),

          // TODO: Find out how to improve typing so that instead of
          // x => withErrorSuppression(x) there could only be withErrorSuppression
          (x) => withErrorSuppression(x),
        ),

        enabled: computed(() => !!registration.enabled),
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


