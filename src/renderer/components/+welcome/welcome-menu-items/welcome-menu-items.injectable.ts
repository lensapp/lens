/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getWelcomeMenuItems } from "./get-welcome-menu-items";

const welcomeMenuItemsInjectable = getInjectable({
  instantiate: (di) =>
    getWelcomeMenuItems({
      extensions: di.inject(rendererExtensionsInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default welcomeMenuItemsInjectable;
