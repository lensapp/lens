// Extensions-api -> Dynamic pages

import { computed, observable } from "mobx";
import React from "react";
import type { IconProps } from "../renderer/components/icon";

export enum DynamicPageType {
  GLOBAL = "lens-scope",
  CLUSTER = "cluster-view-scope",
}

export interface PageRegistration {
  path: string; // route-path
  menuTitle: string;
  type: DynamicPageType;
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
  MenuIcon: React.ComponentType<IconProps>;
}

export class PagesStore {
  protected pages = observable.array<PageRegistration>([], { deep: false });

  @computed get globalPages() {
    return this.pages.filter(page => page.type === DynamicPageType.GLOBAL);
  }

  @computed get clusterPages() {
    return this.pages.filter(page => page.type === DynamicPageType.CLUSTER);
  }

  // todo: verify paths to avoid collision with existing pages
  register(params: PageRegistration) {
    this.pages.push(params);
    return () => {
      this.pages.replace(
        this.pages.filter(page => page.components !== params.components)
      )
    };
  }
}

export const dynamicPages = new PagesStore();
