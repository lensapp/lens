/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";
import requestQuitOfAppInjectable from "../../../../../../main/electron-app/features/require-quit.injectable";

const quitApplicationMenuItemInjectable = getInjectable({
  id: "quit-application-menu-item",

  instantiate: (di) => {
    const isMac = di.inject(isMacInjectable);

    return {
      kind: "clickable-menu-item" as const,
      id: "quit",
      label: "Quit",
      parentId: isMac ? "mac" : "file",
      orderNumber: isMac ? 140 : 70,
      keyboardShortcut: isMac ? "Cmd+Q" : "Alt+F4",
      onClick: di.inject(requestQuitOfAppInjectable),
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default quitApplicationMenuItemInjectable;
