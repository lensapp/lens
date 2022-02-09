/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getWelcomeMenuItems } from "./get-welcome-menu-items";

const welcomeMenuItemsInjectable = getInjectable({
  id: "welcome-menu-items",

  instantiate: (di) =>
    getWelcomeMenuItems({
      extensions: di.inject(rendererExtensionsInjectable),
    }),
});

export default welcomeMenuItemsInjectable;
