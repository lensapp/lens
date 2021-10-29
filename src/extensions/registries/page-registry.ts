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
import { LensExtension, LensExtensionId, sanitizeExtensionName } from "../lens-extension";
import { createPageParam, PageParam, PageParamInit, searchParamsOptions } from "../../renderer/navigation";

export interface PageRegistration {
  /**
   * Page ID, part of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  params?: PageParams<string | Omit<PageParamInit<any>, "name" | "prefix">>;
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget {
  extensionId?: string;
  pageId?: string;
  params?: PageParams;
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
  const { extensionId, pageId = "", params: targetParams = {}} = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionId), pageId]
    .filter(Boolean)
    .join("/").replace(/\/+/g, "/").replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

  const pageUrl = new URL(pagePath, `http://localhost`);

  // stringify params to matched target page
  const registeredPage = GlobalPageRegistry.getInstance().getByPageTarget(target) || ClusterPageRegistry.getInstance().getByPageTarget(target);

  if (registeredPage?.params) {
    Object.entries(registeredPage.params).forEach(([name, param]) => {
      pageUrl.searchParams.delete(name); // first off, clear existing value(s)

      param.stringify(targetParams[name]).forEach(value => {
        if (searchParamsOptions.skipEmpty && !value) return;
        pageUrl.searchParams.append(name, value);
      });
    });
  }

  return pageUrl.href.replace(pageUrl.origin, "");
}

class PageRegistry extends BaseRegistry<PageRegistration, RegisteredPage> {
  protected getRegisteredItem(page: PageRegistration, ext: LensExtension): RegisteredPage {
    const { id: pageId } = page;
    const extensionId = ext.name;
    const params = this.normalizeParams(extensionId, page.params);
    const components = this.normalizeComponents(page.components, params);
    const url = getExtensionPageUrl({ extensionId, pageId });

    return {
      id: pageId, extensionId, params, components, url,
    };
  }

  protected normalizeComponents(components: PageComponents, params?: PageParams<PageParam>): PageComponents {
    if (params) {
      const { Page } = components;

      // inject extension's page component props.params
      components.Page = observer((props: object) => React.createElement(Page, { params, ...props }));
    }

    return components;
  }

  protected normalizeParams(extensionId: LensExtensionId, params?: PageParams<string | Partial<PageParamInit>>): PageParams<PageParam> {
    if (!params) return undefined;
    const normalizedParams: PageParams<PageParam> = {};

    Object.entries(params).forEach(([paramName, paramValue]) => {
      const paramInit: PageParamInit = {
        name: paramName,
        prefix: `${extensionId}:`,
        defaultValue: paramValue,
      };

      // handle non-string params
      if (typeof paramValue !== "string") {
        const { defaultValue: value, parse, stringify } = paramValue;

        const notAStringValue = typeof value !== "string" || (
          Array.isArray(value) && !value.every(value => typeof value === "string")
        );

        if (notAStringValue && !(parse || stringify)) {
          throw new Error(
            `PageRegistry: param's "${paramName}" initialization has failed: 
              paramInit.parse() and paramInit.stringify() are required for non string | string[] "defaultValue"`,
          );
        }

        paramInit.defaultValue = value;
        paramInit.parse = parse;
        paramInit.stringify = stringify;
      }

      normalizedParams[paramName] = createPageParam(paramInit);
    });

    return normalizedParams;
  }

  getByPageTarget(target: PageTarget): RegisteredPage | null {
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId) || null;
  }
}

export class ClusterPageRegistry extends PageRegistry {}
export class GlobalPageRegistry extends PageRegistry {}
