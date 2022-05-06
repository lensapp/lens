/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";


import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import type { TrayMenuItem } from "./tray-menu-item-injection-token";
import { trayMenuItemInjectionToken } from "./tray-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { filter, overSome, sortBy } from "lodash/fp";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";

const trayMenuItemsInjectable = getInjectable({
  id: "tray-menu-items",

  instantiate: (di) => {
    const extensions = di.inject(mainExtensionsInjectable);

    return computed(() => {
      const enabledExtensions = extensions.get();

      return pipeline(
        di.injectMany(trayMenuItemInjectionToken),

        filter((item) =>
          overSome([
            isNonExtensionItem,
            isEnabledExtensionItemFor(enabledExtensions),
          ])(item),
        ),

        filter(item => item.visible.get()),
        items => sortBy("orderNumber", items),
      );
    });
  },
});

const isNonExtensionItem = (item: TrayMenuItem) => !item.extension;

const isEnabledExtensionItemFor =
  (enabledExtensions: LensMainExtension[]) => (item: TrayMenuItem) =>
    !!enabledExtensions.find((extension) => extension === item.extension);


export default trayMenuItemsInjectable;
