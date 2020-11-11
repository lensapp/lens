// Extensions-api -> Register page menu items

import type React from "react";
import type { IconProps } from "../../renderer/components/icon";
import { BaseRegistry } from "./base-registry";
import { matchPath } from "react-router";

export interface PageMenuRegistration {
  url: string;
  title: React.ReactNode;
  components: PageMenuComponents;
  subMenus?: Omit<PageMenuRegistration, "components" | "subMenus">[];
}

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class PageMenuRegistry extends BaseRegistry<PageMenuRegistration> {
  getByMatchingRoute(routePath: string | string[], exact?: boolean) {
    return this.getItems().find(item => !!matchPath(item.url, {
      path: routePath,
      exact,
    }))
  }

  getItems() {
    return super.getItems().map(item => {
      item.url = item.extension.getPageUrl(item.url)
      return item
    });
  }
}

export const globalPageMenuRegistry = new PageMenuRegistry();
export const clusterPageMenuRegistry = new PageMenuRegistry();
