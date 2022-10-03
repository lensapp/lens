/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import populateApplicationMenuInjectable from "./populate-application-menu.injectable";

const applicationMenuReactivityInjectable = getInjectable({
  id: "application-menu-reactivity",

  instantiate: (di) => {
    const applicationMenuItems = di.inject(applicationMenuItemsInjectable);
    const populateApplicationMenu = di.inject(populateApplicationMenuInjectable);

    return getStartableStoppable("application-menu-reactivity", () =>
      autorun(() => populateApplicationMenu(applicationMenuItems.get()), {
        delay: 100,
      }),
    );
  },
});

export default applicationMenuReactivityInjectable;
