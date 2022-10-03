/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import type { MenuItemOpts } from "./application-menu-items.injectable";

const populateApplicationMenuInjectable = getInjectable({
  id: "populate-application-menu",

  instantiate: () => (applicationMenuItems: MenuItemOpts[]) => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(applicationMenuItems));
  },

  causesSideEffects: true,
});

export default populateApplicationMenuInjectable;
