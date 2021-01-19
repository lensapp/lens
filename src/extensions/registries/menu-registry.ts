// Extensions API -> Global menu customizations

import type { MenuItemConstructorOptions } from "electron";
import { BaseRegistry } from "./base-registry";

export interface MenuRegistration extends MenuItemConstructorOptions {
  parentId: string;
}

export class MenuRegistry extends BaseRegistry<MenuRegistration> {
}

export const menuRegistry = new MenuRegistry();
