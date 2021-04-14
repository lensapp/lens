// Extensions-api -> Custom page registration

import React from "react";
import { observer } from "mobx-react";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
import { PageParam, PageParamInit } from "../../renderer/navigation/page-param";
import { createPageParam } from "../../renderer/navigation/helpers";
import { NotFalsy } from "../../common/utils";

export interface PageRegistration<V> {
  /**
   * Page ID, part of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  params?: PageParams<string | ExtensionPageParamInit<V>>;
  components: PageComponents;
}

// exclude "name" field since provided as key in page.params
export type ExtensionPageParamInit<V> = Omit<PageParamInit<V>, "name" | "isSystem">;

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget<V, P = PageParams<V>> {
  extensionId?: string;
  pageId?: string;
  params?: P;
}

export type PageParams<V> = Record<string, V>;

export interface PageComponentProps<V, P extends PageParams<V> = {}> {
  params?: {
    [N in keyof P]: PageParam<P[N]>;
  }
}

export interface RegisteredPage<V> {
  id: string;
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<PageParam<V>>; // normalized params
  components: PageComponents; // normalized components
}

export function getExtensionPageUrl<V>(target: PageTarget<V>): string {
  const { extensionId = "", pageId = "", params: targetParams = {} } = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionId), pageId]
    .filter(NotFalsy)
    .join("/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

  const pageUrl = new URL(pagePath, `http://localhost`);

  // stringify params to matched target page
  const registeredPage = globalPageRegistry.getByPageTarget(target) || clusterPageRegistry.getByPageTarget(target);

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

  return pageUrl.href.replace(pageUrl.origin, "");
}

export class PageRegistry extends BaseRegistry<PageRegistration<any>, RegisteredPage<any>> {
  protected getRegisteredItem<V>(page: PageRegistration<V>, ext: LensExtension): RegisteredPage<V> {
    const { id: pageId = "" } = page;
    const extensionId = ext.name;
    const params = this.normalizeParams(page.params);
    const components = this.normalizeComponents(page.components, params);
    const url = getExtensionPageUrl({ extensionId, pageId });

    return {
      id: pageId, extensionId, params, components, url,
    };
  }

  protected normalizeComponents<V>(components: PageComponents, params?: PageParams<PageParam<V>>): PageComponents {
    if (params) {
      const { Page } = components;

      components.Page = observer((props: object) => React.createElement(Page, { params, ...props }));
    }

    return components;
  }

  protected normalizeParams<V>(params: PageParams<string | ExtensionPageParamInit<V>> = {}): PageParams<PageParam<V>> {
    return Object.fromEntries(
      Object.entries(params)
        .map(([name, value]) => [
          name,
          createPageParam<any>(
            typeof value === "object"
              ? { name, ...value }
              : { name, defaultValue: value }
          )
        ])
    );
  }

  getByPageTarget<V>(target: PageTarget<V>): RegisteredPage<V> | null {
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId) || null;
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
