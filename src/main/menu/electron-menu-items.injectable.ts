/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import mainExtensionsInjectable from "../../extensions/main-extensions.injectable";

const electronMenuItemsInjectable = getInjectable({
  id: "electron-menu-items",

  instantiate: (di) => {
    const extensions = di.inject(mainExtensionsInjectable);

    return computed(() =>
      extensions.get().flatMap((extension) => extension.appMenus));
  },
});

export default electronMenuItemsInjectable;
