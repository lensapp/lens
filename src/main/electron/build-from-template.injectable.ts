/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MenuItemConstructorOptions } from "electron";
import { Menu } from "electron";

export type BuildMenuFromTemplate = (template: MenuItemConstructorOptions[]) => Menu;

const buildMenuFromTemplateInjectable = getInjectable({
  id: "build-menu-from-template",
  instantiate: (): BuildMenuFromTemplate => (template) => Menu.buildFromTemplate(template),
  causesSideEffects: true, // Not really but isn't defined
});

export default buildMenuFromTemplateInjectable;
