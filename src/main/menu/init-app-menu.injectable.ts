/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Menu } from "electron";
import { autorun } from "mobx";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import buildMenuInjectable from "./build-menu.injectable";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

interface Dependencies {
  buildMenu: () => Menu;
}

function initAppMenu({ buildMenu }: Dependencies) {
  return autorun(() => Menu.setApplicationMenu(buildMenu()), {
    delay: 100,
  });
}

const initAppMenuInjectable = getInjectable({
  instantiate: (di) => bind(initAppMenu, null, {
    buildMenu: di.inject(buildMenuInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default initAppMenuInjectable;

