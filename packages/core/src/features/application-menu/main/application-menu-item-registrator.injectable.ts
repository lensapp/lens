/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed } from "mobx";
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
import type {
  ApplicationMenuItemTypes,
  ClickableMenuItem,
  OsActionMenuItem,
  Separator,
} from "./menu-items/application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./menu-items/application-menu-item-injection-token";
import type { MenuRegistration } from "./menu-registration";
import logErrorInjectable from "../../../common/log-error.injectable";

const applicationMenuItemRegistratorInjectable = getInjectable({
  id: "application-menu-item-registrator",

  instantiate: (di) => {
    const logError = di.inject(logErrorInjectable);
    const toRecursedInjectables = toRecursedInjectablesFor(logError);

    return (ext) => {
      const mainExtension = ext as LensMainExtension;

      return computed(() => {
        const appMenus = Array.isArray(mainExtension.appMenus) ? mainExtension.appMenus : mainExtension.appMenus.get();

        return appMenus.flatMap(
          toRecursedInjectables([mainExtension.sanitizedExtensionId]),
        );
      });
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default applicationMenuItemRegistratorInjectable;

const toRecursedInjectablesFor = (logError: (errorMessage: string) => void) => {
  const toRecursedInjectables = (previousIdPath: string[]) =>
    (
      registration: MenuRegistration,
      index: number,
      // Todo: new version of injectable would require less type parameters with defaults.
    ): Injectable<
      ApplicationMenuItemTypes,
      ApplicationMenuItemTypes,
      void
      >[] => {
      const previousIdPathString = previousIdPath.join("/");
      const registrationId = registration.id || index.toString();
      const currentIdPath = [...previousIdPath, registrationId];
      const currentIdPathString = currentIdPath.join("/");
      const parentId = registration.parentId || previousIdPathString;

      const menuItem = getApplicationMenuItem({
        registration,
        parentId,
        currentIdPathString,
        index,
      });

      if (!menuItem) {
        logError(`[MENU]: Tried to register menu item "${currentIdPathString}" but it is not recognizable as any of ApplicationMenuItemTypes`);

        return [];
      }

      return [
        getInjectable({
          id: `${currentIdPathString}/application-menu-item`,

          instantiate: () => menuItem,

          injectionToken: applicationMenuItemInjectionToken,
        }),

        ...((registration.submenu as MenuRegistration[])
          ? (registration.submenu as MenuRegistration[]).flatMap(
            toRecursedInjectables(currentIdPath),
          )
          : []),
      ];
    };

  return toRecursedInjectables;
};

const getApplicationMenuItem = ({
  registration,
  index,
  currentIdPathString,
  parentId,
}: {
  registration: MenuRegistration;
  index: number;
  currentIdPathString: string;
  parentId: string;
}): ApplicationMenuItemTypes | undefined => {
  const orderNumber = 1000 + index * 10;

  if (registration.type === "separator") {
    return {
      kind: "separator" as const,
      id: `${currentIdPathString}-separator`,
      parentId,
      orderNumber,
    } as Separator;
  }

  if (registration.submenu) {
    return {
      kind: "sub-menu" as const,
      id: currentIdPathString,
      parentId,
      isShown: registration.visible ?? true,
      orderNumber,
      label: registration.label || "",
    };
  }

  if (registration.click) {
    return {
      kind: "clickable-menu-item" as const,
      id: currentIdPathString,
      parentId,
      // Todo: hide electron events from this abstraction.
      onClick: registration.click,
      label: registration.label,
      isShown: registration.visible ?? true,
      orderNumber,

      ...(registration.accelerator
        ? { keyboardShortcut: registration.accelerator as string }
        : {}),
    } as ClickableMenuItem;
  }

  if (registration.role) {
    return {
      kind: "os-action-menu-item" as const,
      id: currentIdPathString,
      parentId,
      label: registration.label,
      isShown: registration.visible ?? true,
      orderNumber,
      actionName: registration.role,

      ...(registration.accelerator
        ? { keyboardShortcut: registration.accelerator as string }
        : {}),
    } as OsActionMenuItem;
  }

  return undefined;
};
