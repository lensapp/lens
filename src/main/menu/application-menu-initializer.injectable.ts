/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { buildMenu } from "./menu";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";

const applicationMenuInitializerInjectable = getInjectable({
  id: "application-menu-initializer",

  instantiate: (di) => {
    let disposer: () => void;

    return {
      start: () => {
        const applicationMenuItems = di.inject(applicationMenuItemsInjectable);

        disposer = autorun(() => buildMenu(applicationMenuItems.get()), {
          delay: 100,
        });
      },

      stop: () => disposer?.(),
    };
  },
});

export default applicationMenuInitializerInjectable;
