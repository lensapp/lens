// Extensions-api -> Custom page registration

import React from "react";
import { BaseRegistry, BaseRegistryItem } from "./base-registry";

export interface PageRegistration extends BaseRegistryItem {
  routePath?: string; // additional (suffix) route path to base extension's route: "/extension/:name"
  exact?: boolean; // route matching flag, see: https://reactrouter.com/web/api/NavLink/exact-bool
  components: PageComponents;
  subPages?: SubPageRegistration[];
}

export interface SubPageRegistration {
  routePath: string; // required for sub-pages
  exact?: boolean;
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export class PageRegistry<T extends PageRegistration> extends BaseRegistry<T> {
  getItems() {
    return super.getItems().map(page => {
      const pageRoute = page.extension.getPageRoute(page.routePath);
      return {
        ...page,
        routePath: pageRoute,
        subPages: page?.subPages?.map(subPage => ({
          ...subPage,
          routePath: pageRoute + subPage.routePath
        }))
      }
    });
  }
}

export const globalPageRegistry = new PageRegistry<Omit<PageRegistration, "subPages">>();
export const clusterPageRegistry = new PageRegistry();
