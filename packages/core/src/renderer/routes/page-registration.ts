/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import type { ArrayPageParamDeclaration, DefaultPageParamDeclaration, PageParam, PageParamDeclaration } from "../navigation/page-param";

// Extensions-api -> Custom page registration

export interface PageRegistration<Params = unknown> {
  /**
   * Page ID, part of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-unused-vars
  params?: Params extends PageParams<string | PageParamDeclaration<infer P>> ? Params : never;
  components: PageComponents<Params>;
  enabled?: IComputedValue<boolean>;
}

export interface PageComponents<Params> {
  Page: React.ComponentType<PageComponentProps<Params>>;
}

export interface PageTarget<V> {
  extensionId?: string;
  pageId?: string;
  params?: PageParams<V>;
}

export type PageParams<V> = Record<string, V>;

export type PageComponentProp<Param> =
  Param extends string
    ? PageParam<Param>
    : Param extends DefaultPageParamDeclaration<infer T>
      ? PageParam<T>
      : Param extends ArrayPageParamDeclaration<infer T>
        ? PageParam<T[]>
        : never;

export interface PageComponentProps<Params> {
  params: {
    [N in keyof Params]: PageComponentProp<Params[N]>;
  };
}

export interface RegisteredPage<Params> {
  id: string;
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<Params>; // normalized params
  components: PageComponents<Params>; // normalized components
}
