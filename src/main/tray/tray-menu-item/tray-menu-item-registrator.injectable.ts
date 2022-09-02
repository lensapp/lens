/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
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
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";
import { isBoolean, isString } from "../../../common/utils";

const trayMenuItemRegistratorInjectable = getInjectable({
  id: "tray-menu-item-registrator",

  instantiate: (di) => (extension) => {
    const mainExtension = extension as LensMainExtension;
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);
    const getRandomId = di.inject(getRandomIdInjectable);

    return mainExtension.trayMenus.flatMap(
      toItemInjectablesFor(mainExtension, withErrorLoggingFor, getRandomId),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default trayMenuItemRegistratorInjectable;

const toItemInjectablesFor = (extension: LensMainExtension, withErrorLoggingFor: WithErrorLoggingFor, getRandomId: () => string) => {
  const _toItemInjectables = (parentId: string | null) => (registration: TrayMenuRegistration): Injectable<TrayMenuItem, TrayMenuItem, void>[] => {
    const trayItemId = registration.id || getRandomId();
    const id = `${trayItemId}-tray-menu-item-for-extension-${extension.sanitizedExtensionId}`;

    const parentInjectable = getInjectable({
      id,

      instantiate: () => ({
        id,
        parentId,
        orderNumber: 100,

        separator: registration.type === "separator",

        label: computed(() => {
          if (!registration.label) {
            return "";
          }

          if (isString(registration.label)) {
            return registration.label;
          }

          return registration.label.get();
        }),

        tooltip: registration.toolTip,

        click: () => {
          const decorated = pipeline(
            registration.click || (() => {}),

            withErrorLoggingFor(
              () =>
                `[TRAY]: Clicking of tray item "${trayItemId}" from extension "${extension.sanitizedExtensionId}" failed.`,
            ),

            // TODO: Find out how to improve typing so that instead of
            // x => withErrorSuppression(x) there could only be withErrorSuppression
            (x) => withErrorSuppression(x),
          );

          return decorated(registration);
        },

        enabled: computed(() => {
          if (registration.enabled === undefined) {
            return true;
          }

          if (isBoolean(registration.enabled)) {
            return registration.enabled;
          }

          return registration.enabled.get();
        }),

        visible: computed(() => {
          if (!registration.visible) {
            return true;
          }

          return registration.visible.get();
        }),
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


