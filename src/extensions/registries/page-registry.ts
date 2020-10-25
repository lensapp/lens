// Extensions-api -> Dynamic pages

import type React from "react";
import type { RouteProps } from "react-router";
import type { IconProps } from "../../renderer/components/icon";
import type { IClassName } from "../../renderer/utils";
import type { TabRoute } from "../../renderer/components/layout/tab-layout";
import { BaseRegistry } from "./base-registry";
import { computed } from "mobx";

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

export class PageRegistry extends BaseRegistry<PageRegistration> {
  @computed get globalPages() {
    return this.items.filter(page => page.type === PageRegistryType.GLOBAL);
  }

  @computed get clusterPages() {
    return this.items.filter(page => page.type === PageRegistryType.CLUSTER);
  }
}

export const pageRegistry = new PageRegistry();
