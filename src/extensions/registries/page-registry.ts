// Extensions-api -> Custom page registration
import type React from "react";
import { action } from "mobx";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
import { UrlParam } from "../../renderer/navigation/url-param";
import logger from "../../main/logger";

export interface PageRegistration {
  /**
   * Page-id, part of of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  components: PageComponents;
  /**
   * Registered page params.
   * Used to generate final page url when provided in getExtensionPageUrl()-helper.
   * Advanced usage: provide `UrlParam` as values to customize parsing/stringification from/to URL.
   */
  params?: PageTargetParams<string | UrlParam>;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget<P = PageTargetParams> {
  extensionId?: string;
  pageId?: string;
  params?: P;
}

export interface PageTargetParams<V = any> {
  [paramName: string]: V;
}

export interface RegisteredPage extends PageRegistration {
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
}

export function getExtensionPageUrl(target: PageTarget): string {
  const { extensionId, pageId = "", params: targetPageParams = {} } = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionId), pageId].join("/");
  const pageUrl = new URL(pagePath, `http://localhost`);

  // stringify params to matched target page
  const targetPage = globalPageRegistry.getByPageTarget(target) || clusterPageRegistry.getByPageTarget(target);

  if (targetPage?.params) {
    Object.entries(targetPage.params).forEach(([name, param]) => {
      const paramValue = targetPageParams[name];
      if (param instanceof UrlParam) {
        pageUrl.searchParams.set(name, param.stringify(paramValue));
      } else {
        pageUrl.searchParams.set(name, String(paramValue ?? param));
      }
    })
  }

  return pageUrl.href.replace(pageUrl.origin, "");
}

export class PageRegistry extends BaseRegistry<RegisteredPage> {
  @action
  add(pages: PageRegistration | PageRegistration[], extension: LensExtension) {
    try {
      const items = [pages].flat().map(page => this.registerPage(page, extension));

      return super.add(items);
    } catch (error) {
      return Function; // no-op
    }
  }

  registerPage(page: PageRegistration, ext: LensExtension): RegisteredPage {
    try {
      const { id: pageId } = page;
      const extensionId = ext.name;

      return {
        ...page,
        extensionId,
        url: getExtensionPageUrl({ extensionId, pageId }),
      };
    } catch (error) {
      logger.error(`Failed to register page: ${error}`, { error });
    }
  }

  getByPageTarget(target: PageTarget): RegisteredPage | null {
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId) || null;
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
