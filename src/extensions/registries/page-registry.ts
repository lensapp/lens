/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Extensions-api -> Custom page registration

import React from "react";
import { observer } from "mobx-react";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
import type { PageParam, PageParamInit } from "../../renderer/navigation/page-param";
import { createPageParam } from "../../renderer/navigation/helpers";

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

export interface PageTarget<P = PageParams> {
  extensionId?: string;
  pageId?: string;
  params?: P;
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
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<PageParam>; // normalized params
  components: PageComponents; // normalized components
}

export function getExtensionPageUrl(target: PageTarget): string {
  const { extensionId, pageId = "", params: targetParams = {} } = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionId), pageId]
    .filter(Boolean)
    .join("/").replace(/\/+/g, "/").replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

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

export class PageRegistry extends BaseRegistry<PageRegistration, RegisteredPage> {
  protected getRegisteredItem(page: PageRegistration, ext: LensExtension): RegisteredPage {
    const { id: pageId } = page;
    const extensionId = ext.name;
    const params = this.normalizeParams(page.params);
    const components = this.normalizeComponents(page.components, params);
    const url = getExtensionPageUrl({ extensionId, pageId });

    return {
      id: pageId, extensionId, params, components, url,
    };
  }

  protected normalizeComponents(components: PageComponents, params?: PageParams<PageParam>): PageComponents {
    if (params) {
      const { Page } = components;

      components.Page = observer((props: object) => React.createElement(Page, { params, ...props }));
    }

    return components;
  }

  protected normalizeParams(params?: PageParams<string | ExtensionPageParamInit>): PageParams<PageParam> | undefined {
    if (!params) {
      return undefined;
    }
    Object.entries(params).forEach(([name, value]) => {
      const paramInit: PageParamInit = typeof value === "object"
        ? { name, ...value }
        : { name, defaultValue: value };

      params[paramInit.name] = createPageParam(paramInit);
    });

    return params as PageParams<PageParam>;
  }

  getByPageTarget(target: PageTarget): RegisteredPage | null {
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId) || null;
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
