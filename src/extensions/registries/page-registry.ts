/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { PageParamInit, PageParam } from "../../renderer/navigation";

// Extensions-api -> Custom page registration

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
  };
}

export interface RegisteredPage {
  id: string;
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<PageParam<any>>; // normalized params
  components: PageComponents; // normalized components
}
