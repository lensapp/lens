// Extensions-api -> Custom page registration
import type React from "react";
import type { UrlParam } from "../../renderer/navigation/url-param";

import path from "path";
import { action } from "mobx";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
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
   * Used to generate page url when provided in getExtensionPageUrl()-helper.
   */
  params?: UrlParam[];
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget<P = {}> {
  extensionId?: string;
  pageId?: string;
  params?: Record<string, any | any[]> & P;
}

export interface RegisteredPage extends PageRegistration {
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
}

export function getExtensionPageUrl<P extends object>(target: PageTarget): string {
  const { extensionId, pageId = "", params } = target;
  let stringifiedParams = "";

  // stringify params to matched target page
  if (params) {
    const page = globalPageRegistry.getByPageTarget(target) || clusterPageRegistry.getByPageTarget(target);
    if (page?.params) {
      const searchParams: string[] = [];
      page.params.forEach(urlParam => {
        const paramValue = params[urlParam.name];
        if (paramValue == undefined) return;
        searchParams.push(
          urlParam.toSearchString(paramValue, { mergeGlobals: false, withPrefix: false }) // e.g. "param=value"
        );
      });
      if (searchParams.length > 0) {
        stringifiedParams = `?${searchParams.join("&")}`;
      }
    }
  }

  return path.posix.join("/extension", sanitizeExtensionName(extensionId), pageId, stringifiedParams);
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
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId);
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
