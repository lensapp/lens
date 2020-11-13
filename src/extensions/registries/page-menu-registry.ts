// Extensions-api -> Register page menu items

import type React from "react";
import { action } from "mobx";
import type { IconProps } from "../../renderer/components/icon";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension";
import { PageRegistration } from "../interfaces";

export interface PageMenuTarget {
  pageId: string;
  extensionId?: string;
  params?: object;
}

export interface PageMenuRegistration {
  target?: PageMenuTarget;
  title: React.ReactNode;
  components: PageMenuComponents;
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
      if (!i.target.extensionId) {
        i.target.extensionId = ext.name
      }
      return i
    })
    return super.add(normalizedItems);
  }
}

export const globalPageMenuRegistry = new PageMenuRegistry<Omit<PageMenuRegistration, "subMenus">>();
export const clusterPageMenuRegistry = new PageMenuRegistry();
