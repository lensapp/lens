/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import { webContents } from "electron";

const goForwardMenuItemInjectable = getInjectable({
  id: "go-forward-menu-item",

  instantiate: () => ({
    kind: "clickable-menu-item" as const,
    parentId: "view",
    id: "go-forward",
    orderNumber: 50,
    label: "Forward",
    keyboardShortcut: "CmdOrCtrl+]",

    onClick: () => {
      webContents
        .getAllWebContents()
        .filter((wc) => wc.getType() === "window")
        .forEach((wc) => wc.goForward());
    },
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default goForwardMenuItemInjectable;
