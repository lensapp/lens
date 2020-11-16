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

export interface PageComponents {
  Page: React.ComponentType<any>;
}

const routePrefix = "/extension/:name"

export function sanitizeExtensioName(name: string) {
  return name.replace("@", "").replace("/", "-")
}

export function getPageUrl(ext: LensExtension, baseUrl = "") {
  if (baseUrl !== "" && !baseUrl.startsWith("/")) {
    baseUrl = "/" + baseUrl
  }
  const validUrlName = sanitizeExtensioName(ext.name);
  return compile(routePrefix)({ name: validUrlName }) + baseUrl;
}

export class PageRegistry<T extends PageRegistration> extends BaseRegistry<T> {

  @action
  add(items: T[], ext?: LensExtension) {
    const normalizedItems = items.map((page) => {
      if (!page.routePath) {
        page.routePath = `/${page.id}`
      }
      page.routePath = getPageUrl(ext, page.routePath)
      return page
    })
    return super.add(normalizedItems);
  }

  getByPageMenuTarget(target: PageMenuTarget) {
    if (!target) {
      return null
    }
    const routePath = `/extension/${sanitizeExtensioName(target.extensionId)}/`
    return this.getItems().find((page) => page.routePath.startsWith(routePath) && page.id === target.pageId) || null
  }
}

export const globalPageRegistry = new PageRegistry<PageRegistration>();
export const clusterPageRegistry = new PageRegistry<PageRegistration>();
