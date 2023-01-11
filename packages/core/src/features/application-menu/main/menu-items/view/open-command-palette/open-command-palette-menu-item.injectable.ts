/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import broadcastMessageInjectable from "../../../../../../common/ipc/broadcast-message.injectable";

const openCommandPaletteMenuItemInjectable = getInjectable({
  id: "open-command-palette-menu-item",

  instantiate: (di) => {
    const broadcastMessage = di.inject(broadcastMessageInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "view",
      id: "open-command-palette",
      orderNumber: 20,
      label: "Command Palette...",
      keyboardShortcut: "Shift+CmdOrCtrl+P",

      onClick(_m, _b, event) {
        /**
         * Don't broadcast unless it was triggered by menu iteration so that
         * there aren't double events in renderer
         *
         * NOTE: this `?` is required because of a bug in playwright. https://github.com/microsoft/playwright/issues/10554
         */
        if (!event?.triggeredByAccelerator) {
          broadcastMessage("command-palette:open");
        }
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default openCommandPaletteMenuItemInjectable;
