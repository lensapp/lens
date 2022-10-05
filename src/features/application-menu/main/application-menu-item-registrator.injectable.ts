/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensExtension } from "../../../extensions/lens-extension";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
import type { ClickableMenuItem, Separator } from "./menu-items/application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./menu-items/application-menu-item-injection-token";

const applicationMenuItemRegistratorInjectable = getInjectable({
  id: "application-menu-item-registrator",

  instantiate: () => (ext: LensExtension) => {
    const extension = ext as LensMainExtension;

    return extension.appMenus.map((registration, index) => {
      const registrationId = registration.id || index;
      const applicationMenuId = `${extension.sanitizedExtensionId}/application-menu-item`;

      return getInjectable({
        id: `${applicationMenuId}/${registrationId}`,

        instantiate: () => {
          const orderNumber = 1000 + index * 10;

          if (registration.type === "separator") {
            return {
              kind: "separator" as const,
              id: `${applicationMenuId}/separator(${registrationId})`,
              parentId: registration.parentId,
              orderNumber,
            } as Separator;
          }

          return {
            kind: "clickable-menu-item" as const,
            id: `${applicationMenuId}/clickable-menu-item(${registrationId})`,
            parentId: registration.parentId,
            // Todo: hide electron evens from this abstraction.
            onClick: registration.click,
            label: registration.label,
            isShown: registration.visible ?? true,
            orderNumber,
            ...(registration.accelerator ? { keyboardShortcut: registration.accelerator as string } : {}),
          } as ClickableMenuItem;
        },

        injectionToken: applicationMenuItemInjectionToken,
      });
    });
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default applicationMenuItemRegistratorInjectable;
