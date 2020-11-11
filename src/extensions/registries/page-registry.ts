// Extensions-api -> Custom page registration

import React from "react";
import { matchPath } from "react-router";
import { BaseRegistry } from "./base-registry";

export interface PageRegistration {
  routePath: string; // react-router's path, e.g. "/page/:id"
  exact?: boolean; // route matching flag, see: https://reactrouter.com/web/api/NavLink/exact-bool
  components: PageComponents;
  subPages?: Omit<PageRegistration, "subPages">[];
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export class PageRegistry extends BaseRegistry<PageRegistration> {
  getByMatchingUrl(baseUrl: string) {
    return this.getItems().find(({ routePath: path, exact }) => {
      return !!matchPath(baseUrl, { path, exact });
    })
  }

  getItems() {
    return super.getItems().map(item => {
      item.routePath = item.extension.getPageRoute(item.routePath)
      return item
    });
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
