// Extensions-api -> Register page menu items
import type { IconProps } from "../../renderer/components/icon";
import type React from "react";
import { action } from "mobx";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension";
import { RegisteredPage } from "./page-registry";

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

export interface ClusterPageMenuRegistration extends PageMenuRegistration {
  id?: string;
  parentId?: string;
}

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class GlobalPageMenuRegistry extends BaseRegistry<PageMenuRegistration> {
  @action
  add(items: PageMenuRegistration[], ext: LensExtension) {
    const normalizedItems = items.map(menuItem => {
      menuItem.target = {
        extensionId: ext.name,
        ...(menuItem.target || {}),
      };

      return menuItem;
    });

    return super.add(normalizedItems);
  }
}

export class ClusterPageMenuRegistry extends BaseRegistry<ClusterPageMenuRegistration> {
  @action
  add(items: PageMenuRegistration[], ext: LensExtension) {
    const normalizedItems = items.map(menuItem => {
      menuItem.target = {
        extensionId: ext.name,
        ...(menuItem.target || {}),
      };

      return menuItem;
    });

    return super.add(normalizedItems);
  }

  getRootItems() {
    return this.getItems().filter((item) => !item.parentId);
  }

  getSubItems(parent: ClusterPageMenuRegistration) {
    return this.getItems().filter((item) => item.parentId === parent.id && item.target.extensionId === parent.target.extensionId);
  }

  getByPage(page: RegisteredPage) {
    return this.getItems().find((item) => item.target?.pageId == page.id && item.target?.extensionId === page.extensionId);
  }
}

export const globalPageMenuRegistry = new GlobalPageMenuRegistry();
export const clusterPageMenuRegistry = new ClusterPageMenuRegistry();
