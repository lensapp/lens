// Extensions-api -> Register page menu items

import type React from "react";
import type { IconProps } from "../../renderer/components/icon";
import { BaseRegistry, BaseRegistryItem, BaseRegistryItemId } from "./base-registry";

export interface PageMenuRegistration extends BaseRegistryItem {
  id: BaseRegistryItemId; // required id from page-registry item to match with
  url?: string; // when not provided initial extension's path used, e.g. "/extension/lens-extension-name"
  title: React.ReactNode;
  components: PageMenuComponents;
  subMenus?: PageSubMenuRegistration[];
}

export interface PageSubMenuRegistration {
  url: string;
  title: React.ReactNode;
}

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class PageMenuRegistry<T extends PageMenuRegistration> extends BaseRegistry<T> {
  getItems() {
    return super.getItems().map(item => {
      item.url = item.extension.getPageUrl(item.url)
      return item
    });
  }
}

export const globalPageMenuRegistry = new PageMenuRegistry<Omit<PageMenuRegistration, "subMenus">>();
export const clusterPageMenuRegistry = new PageMenuRegistry();
