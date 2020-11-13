// Extensions-api -> Register page menu items

import type React from "react";
import { action } from "mobx";
import type { IconProps } from "../../renderer/components/icon";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension";
import { getPageUrl } from "./page-registry";

export interface PageMenuRegistration {
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
  @action
  add(items: T[], ext?: LensExtension) {
    const normalizedItems = items.map((i) => {
      i.url = getPageUrl(ext, i.url)
      return i
    })
    return super.add(normalizedItems);
  }

  getByRoutePath(routePath: string) {
    return this.getItems().find((i) => i.url === routePath)
  }
}

export const globalPageMenuRegistry = new PageMenuRegistry<Omit<PageMenuRegistration, "subMenus">>();
export const clusterPageMenuRegistry = new PageMenuRegistry();
