// Extensions-api -> Dynamic pages

import type React from "react";
import type { RouteProps } from "react-router";
import type { IconProps } from "../../renderer/components/icon";
import type { IClassName } from "../../renderer/utils";
import type { TabRoute } from "../../renderer/components/layout/tab-layout";
import { computed, observable } from "mobx";

export enum PageRegistryType {
  GLOBAL = "lens-scope",
  CLUSTER = "cluster-view-scope",
}

export interface PageRegistration extends RouteProps {
  type: PageRegistryType;
  components: PageComponents;
  className?: IClassName;
  url?: string; // initial url to be used for building menus and tabs, otherwise "path" applied by default
  title?: React.ReactNode; // used in sidebar's & tabs-layout if provided
  subPages?: (PageRegistration & TabRoute)[];
}

export interface PageComponents {
  Page: React.ComponentType<any>;
  MenuIcon?: React.ComponentType<IconProps>;
}

export class PageRegistry {
  protected pages = observable.array<PageRegistration>([], { deep: false });

  @computed get globalPages() {
    return this.pages.filter(page => page.type === PageRegistryType.GLOBAL);
  }

  @computed get clusterPages() {
    return this.pages.filter(page => page.type === PageRegistryType.CLUSTER);
  }

  // fixme: validate route paths to avoid collisions
  add(pageInit: PageRegistration) {
    this.pages.push(pageInit);
    return () => this.pages.remove(pageInit); // works because of {deep: false};
  }
}

export const pageRegistry = new PageRegistry();
