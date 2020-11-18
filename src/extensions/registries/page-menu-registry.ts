// Extensions-api -> Register page menu items
import type { IconProps } from "../../renderer/components/icon";
import type React from "react";
import { action } from "mobx";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension";

export interface PageMenuTarget<P extends object = any> {
  extensionId?: string;
  pageId?: string;
  params?: P;
}

export interface PageMenuRegistration {
  target?: PageMenuTarget;
  title: React.ReactNode;
  components: PageMenuComponents;
}

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class PageMenuRegistry extends BaseRegistry<PageMenuRegistration, Required<PageMenuRegistration>> {
  @action
  add(items: PageMenuRegistration[], ext: LensExtension) {
    const normalizedItems = items.map(menuItem => {
      menuItem.target = {
        extensionId: ext.name,
        ...(menuItem.target || {}),
      };
      return menuItem
    })
    return super.add(normalizedItems);
  }
}

export const globalPageMenuRegistry = new PageMenuRegistry();
export const clusterPageMenuRegistry = new PageMenuRegistry();
