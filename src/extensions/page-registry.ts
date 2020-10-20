// Extensions-api -> Dynamic pages

import { computed, observable } from "mobx";
import React from "react";
import { RouteProps } from "react-router";
import { IconProps } from "../renderer/components/icon";
import { IClassName } from "../renderer/utils";
import { TabRoute } from "../renderer/components/layout/tab-layout";

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
  add(params: PageRegistration) {
    this.pages.push(params);
    return () => {
      this.pages.replace(
        this.pages.filter(page => page.components !== params.components)
      )
    };
  }
}

export const pageRegistry = new PageRegistry();
