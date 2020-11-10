// Extensions-api -> Custom page registration

import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface PageRegistration {
  routePath: string; // react-router's path, e.g. "/page/:id"
  exact?: boolean; // route matching flag, see: https://reactrouter.com/web/api/NavLink/exact-bool
  components: PageComponents;
}

export interface PageRegistrationCluster extends PageRegistration {
  subPages?: Omit<PageRegistration, "subPages">;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export class PageRegistry<T extends PageRegistration> extends BaseRegistry<T> {
  protected routePrefixPath = "/extensions/:name" // todo: figure out how to provide inside extension

  getItems() {
    return super.getItems();
  }
}

export const globalPageRegistry = new PageRegistry<PageRegistration>();
export const clusterPageRegistry = new PageRegistry<PageRegistrationCluster>();
