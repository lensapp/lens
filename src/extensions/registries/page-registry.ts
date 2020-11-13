// Extensions-api -> Custom page registration

import React from "react";
import { action } from "mobx";
import { compile } from "path-to-regexp";
import { BaseRegistry } from "./base-registry";
import { LensExtension } from "../lens-extension"
import type { PageMenuTarget } from "./page-menu-registry";

export interface PageRegistration {
  id: string; // will be automatically prefixed with extension name
  routePath?: string; // additional (suffix) route path to base extension's route: "/extension/:name"
  exact?: boolean; // route matching flag, see: https://reactrouter.com/web/api/NavLink/exact-bool
  components: PageComponents;
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

  getByPageMenuTarget(target: PageMenuTarget) {
    if (!target) {
      return null
    }
    return this.getItems().find((page) => page.routePath.startsWith(`/extension/${target.extensionId}/`) && page.id === target.pageId)
  }
}

export const globalPageRegistry = new PageRegistry<PageRegistration>();
export const clusterPageRegistry = new PageRegistry<PageRegistration>();
