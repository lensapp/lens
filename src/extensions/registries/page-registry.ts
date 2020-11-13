// Extensions-api -> Custom page registration

import React from "react";
import { action } from "mobx";
import { compile } from "path-to-regexp";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension"

export interface PageRegistration {
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

const routePrefix = "/extension/:name"

export function getPageUrl(ext: LensExtension, baseUrl = "") {
  const validUrlName = ext.name.replace("@", "").replace("/", "-");
  return compile(routePrefix)({ name: validUrlName }) + baseUrl;
}

export class PageRegistry<T extends PageRegistration> extends BaseRegistry<T> {

  @action
  add(items: T[], ext?: LensExtension) {
    const normalizedItems = items.map((i) => {
      i.routePath = getPageUrl(ext, i.routePath)
      return i
    })
    return super.add(normalizedItems);
  }

  getByUrl(url: string) {
    return this.getItems().find((i) => i.routePath === url)
  }
}

export const globalPageRegistry = new PageRegistry<Omit<PageRegistration, "subPages">>();
export const clusterPageRegistry = new PageRegistry();
