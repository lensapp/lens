// Dynamic pages

import React from "react";
import { computed, observable } from "mobx";
import type { IconProps } from "../icon";

export interface PageRegistration {
  path: string;
  type: "global" | "cluster-view";
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
  MenuIcon: React.ComponentType<IconProps>;
}

export class PagesStore {
  protected pages = observable.array<PageRegistration>([], { deep: false });

  @computed get globalPages() {
    return this.pages.filter(page => page.type === "global");
  }

  @computed get clusterPages() {
    return this.pages.filter(page => page.type === "cluster-view");
  }

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
