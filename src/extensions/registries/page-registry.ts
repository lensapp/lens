// Extensions-api -> Custom page registration
import type { PageMenuTarget } from "./page-menu-registry";
import type React from "react";
import path from "path";
import { action } from "mobx";
import { compile } from "path-to-regexp";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
import logger from "../../main/logger";
import { rectify } from "../../common/utils";

export interface PageRegistration {
  /**
   * Page ID or additional route path to indicate uniqueness within current extension registered pages
   * Might contain special url placeholders, e.g. "/users/:userId?" (? - marks as optional param)
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  /**
   * Strict route matching to provided page-id, read also: https://reactrouter.com/web/api/NavLink/exact-bool
   * In case when more than one page registered at same extension "pageId" is required to identify different pages,
   * It might be useful to provide `exact: true` in some cases to avoid overlapping routes.
   * Without {exact:true} second page never matches since first page-id/route already includes partial route.
   * @example const pages = [
   *  {id: "/users", exact: true},
   *  {id: "/users/:userId?"}
   * ]
   * Pro-tip: registering pages in opposite order will make same effect without "exact".
   */
  exact?: boolean;
  components: PageComponents;
}

export interface RegisteredPage extends PageRegistration {
  extensionId: string; // required for compiling registered page to url with page-menu-target to compare
  routePath: string; // full route-path to registered extension page
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export function getExtensionPageUrl<P extends object>({ extensionId, pageId = "", params }: PageMenuTarget<P>): string {
  const extensionBaseUrl = compile(`/extension/:name`)({
    name: sanitizeExtensionName(extensionId), // compile only with extension-id first and define base path
  });
  const extPageRoutePath = path.join(extensionBaseUrl, pageId); // page-id might contain route :param-s, so don't compile yet

  if (params) {
    return compile(extPageRoutePath)(params); // might throw error when required params not passed
  }

  return extPageRoutePath;
}

export class PageRegistry extends BaseRegistry<RegisteredPage> {
  @action
  add(items: PageRegistration | PageRegistration[], ext: LensExtension) {
    const itemArray = rectify(items);
    let registeredPages: RegisteredPage[] = [];

    try {
      registeredPages = itemArray.map(page => ({
        ...page,
        extensionId: ext.name,
        routePath: getExtensionPageUrl({ extensionId: ext.name, pageId: page.id }),
      }));
    } catch (err) {
      logger.error(`[EXTENSION]: page-registration failed`, {
        items,
        extension: ext,
        error: String(err),
      });
    }

    return super.add(registeredPages);
  }

  getUrl<P extends object>({ extensionId, id: pageId }: RegisteredPage, params?: P) {
    return getExtensionPageUrl({ extensionId, pageId, params });
  }

  getByPageMenuTarget(target: PageMenuTarget = {}): RegisteredPage | null {
    const targetUrl = getExtensionPageUrl(target);

    return this.getItems().find(({ id: pageId, extensionId }) => {
      const pageUrl = getExtensionPageUrl({ extensionId, pageId, params: target.params }); // compiled with provided params

      return targetUrl === pageUrl;
    }) || null;
  }
}

export const globalPageRegistry = new PageRegistry();
export const clusterPageRegistry = new PageRegistry();
