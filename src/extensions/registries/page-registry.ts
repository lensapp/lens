// Extensions-api -> Custom page registration

import React from "react";
import { observer } from "mobx-react";
import { sanitizeExtensionName } from "../lens-extension";
import { PageParam, PageParamInit } from "../../renderer/navigation/page-param";
import { createPageParam } from "../../renderer/navigation/helpers";
import { extensionLoader } from "../extension-loader";
import { LensRendererExtension } from "../core-api";
import { registeredClusterPages, registeredGlobalPages } from "../lens-renderer-extension";
import { TabLayoutRoute } from "../renderer-api/components";
import { RegistrationScope } from "./sources";
import { getChildClusterPageMenus, RegisteredClusterPageMenu } from "./page-menu-registry";

export interface PageRegistration {
  /**
   * Page ID, part of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  params?: PageParams<string | ExtensionPageParamInit>;
  components: PageComponents;
}

// exclude "name" field since provided as key in page.params
export type ExtensionPageParamInit = Omit<PageParamInit, "name" | "isSystem">;

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget<P extends PageParams = PageParams> {
  extensionName?: string;
  pageId?: string;
  params?: P;
}

export interface RegisteredPageTarget<P extends PageParams = PageParams> extends PageTarget<P> {
  extensionName: string
}

export interface PageParams<V = any> {
  [paramName: string]: V;
}

export interface PageComponentProps<P extends PageParams = {}> {
  params?: {
    [N in keyof P]: PageParam<P[N]>;
  }
}

export interface RegisteredPage {
  id: string;
  extensionName: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<PageParam>; // normalized params
  components: PageComponents; // normalized components
}

/**
 * Finds the first registered page on `extension` matching `pageId` in all of `sources`' scopes
 * @param extension The extension to query for a matching `RegisteredPage`
 * @param pageId The `PageId` to search for
 * @param sources Whether to search for global pages or cluster pages or both
 */
export function findRegisteredPage(extension: LensRendererExtension | undefined, pageId?: string, sources = new Set([RegistrationScope.GLOBAL, RegistrationScope.CLUSTER])): RegisteredPage | null {
  if (sources.has(RegistrationScope.GLOBAL)) {
    const page = extension?.[registeredGlobalPages].find(page => page.id === pageId);

    if (page) {
      return page;
    }
  }

  if (sources.has(RegistrationScope.CLUSTER)) {
    const page = extension?.[registeredClusterPages].find(page => page.id === pageId);

    if (page) {
      return page;
    }
  }

  return null;
}

export function getExtensionPageUrl(target: PageTarget): string {
  const { extensionName, pageId = "", params: targetParams = {} } = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionName), pageId]
    .filter(Boolean)
    .join("/").replace(/\/+/g, "/").replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

  const pageUrl = new URL(pagePath, `http://localhost`);

  // stringify params to matched target page
  const extension = extensionLoader.getExtensionByName(extensionName);

  if (extension instanceof LensRendererExtension) {
    const registeredPage = findRegisteredPage(extension, target.pageId);

    if (registeredPage?.params) {
      Object.entries(registeredPage.params).forEach(([name, param]) => {
        const paramValue = param.stringify(targetParams[name]);

        if (param.init.skipEmpty && param.isEmpty(paramValue)) {
          pageUrl.searchParams.delete(name);
        } else {
          pageUrl.searchParams.set(name, paramValue);
        }
      });
    }
  }


  return pageUrl.href.replace(pageUrl.origin, "");
}

function normalizeComponents(components: PageComponents, params?: PageParams<PageParam>): PageComponents {
  if (params) {
    const { Page } = components;

    components.Page = observer((props: object) => React.createElement(Page, { params, ...props }));
  }

  return components;
}

function normalizeParams(params?: PageParams<string | ExtensionPageParamInit>): PageParams<PageParam> {
  if (!params) {
    return;
  }

  Object.entries(params).forEach(([name, value]) => {
    const paramInit: PageParamInit = typeof value === "object"
      ? { name, ...value }
      : { name, defaultValue: value };

    params[paramInit.name] = createPageParam(paramInit);
  });

  return params as PageParams<PageParam>;
}

export function getRegisteredPage({ id, ...page}: PageRegistration, extensionName: string): RegisteredPage {
  const params = normalizeParams(page.params);
  const components = normalizeComponents(page.components);

  const pagePath = ["/extension", sanitizeExtensionName(extensionName), id]
    .filter(Boolean)
    .join("/").replace(/\/+/g, "/").replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

  const pageUrl = new URL(pagePath, `http://localhost`);
  const url = pageUrl.href.replace(pageUrl.origin, "");

  return { id, params, components, extensionName, url };
}

/**
 * Find the `RegisteredPage` of an extension looking through all `sources`
 * @param target The `extensionName` and `pageId` for the desired page
 * @param sources Whether to search for global pages or cluster pages or both
 */
export function getByPageTarget(target?: PageTarget, sources = new Set([RegistrationScope.GLOBAL, RegistrationScope.CLUSTER])): RegisteredPage | null {
  return findRegisteredPage(
    extensionLoader.getExtensionByName(target?.extensionName) as LensRendererExtension,
    target?.pageId,
    sources,
  );
}

/**
 * Gets all the registered pages from all extensions
 * @param source Whether to get all the global or cluster pages
 */
export function getAllRegisteredPages(source: RegistrationScope): RegisteredPage[] {
  const extensions = extensionLoader.allEnabledInstances as LensRendererExtension[];

  switch (source) {
    case RegistrationScope.GLOBAL:
      return extensions.flatMap(ext => ext[registeredGlobalPages]);
    case RegistrationScope.CLUSTER:
      return extensions.flatMap(ext => ext[registeredClusterPages]);
  }
}

export function getTabLayoutRoutes(parentMenu: RegisteredClusterPageMenu): TabLayoutRoute[] {
  if (!parentMenu.id) {
    return [];
  }

  return getChildClusterPageMenus(parentMenu)
    .map(subMenu => [
      getByPageTarget(subMenu.target),
      subMenu,
    ] as const)
    .filter(([subPage]) => subPage)
    .map(([{ components, extensionName, id: pageId, url }, { title, target: { params } }]) => ({
      routePath: url,
      url: getExtensionPageUrl({ extensionName, pageId, params }),
      title,
      component: components.Page,
    }));
}
