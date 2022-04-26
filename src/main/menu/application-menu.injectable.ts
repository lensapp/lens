/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { buildMenu } from "./menu";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";

const applicationMenuInjectable = getInjectable({
  id: "application-menu",

  instantiate: (di) => {
    const applicationMenuItems = di.inject(applicationMenuItemsInjectable);

    return getStartableStoppable("build-of-application-menu", () =>
      autorun(() => buildMenu(applicationMenuItems.get()), {
        delay: 100,
      }),
    );
  },
});

export default applicationMenuInjectable;
