/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import { webContents } from "electron";

const goBackMenuItemInjectable = getInjectable({
  id: "go-back-menu-item",

  instantiate: () => ({
    parentId: "view",
    id: "go-back",
    orderNumber: 40,
    label: "Back",
    accelerator: "CmdOrCtrl+[",

    click: () => {
      webContents
        .getAllWebContents()
        .filter((wc) => wc.getType() === "window")
        .forEach((wc) => wc.goBack());
    },
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default goBackMenuItemInjectable;
