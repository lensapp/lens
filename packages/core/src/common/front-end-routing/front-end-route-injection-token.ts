/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isFunction, isString } from "@k8slens/utilities";
import type { DiContainerForInjection, Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { Simplify } from "type-fest";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

declare const emptyObjectSymbol: unique symbol;

export interface EmptyObject {[emptyObjectSymbol]?: never}

export const frontEndRouteInjectionToken = getInjectionToken<Route<string>>({
  id: "front-end-route-injection-token",
});

type InferParamFromPart<Part extends string> =
  Part extends `:${infer Name}?`
    ? { [key in Name]?: string }
    : Part extends `:${infer Name}`
      ? { [key in Name]: string }
      : EmptyObject;

export type HelperInferParamFromPath<Path extends string> =
  Path extends `/${infer First}/${infer Tail}`
    ? InferParamFromPart<First> & HelperInferParamFromPath<`/${Tail}`>
    : Path extends `/${infer First}`
      ? InferParamFromPart<First>
      : EmptyObject;

export type InferParamFromPath<Path extends string> = keyof Simplify<Omit<HelperInferParamFromPath<Path>, typeof emptyObjectSymbol>> extends never
  ? EmptyObject
  : Simplify<Omit<HelperInferParamFromPath<Path>, typeof emptyObjectSymbol>>;

export type ParametersFromRouteInjectable<RouteInjectable> =
  RouteInjectable extends Injectable<Route<infer Path extends string>, Route<string>, void>
    ? InferParamFromPath<Path>
    : never;

export type RouteFromInjectable<RouteInjectable> =
  RouteInjectable extends Injectable<Route<infer Path extends string>, Route<string>, void>
    ? Route<Path>
    : never;

export interface Route<Path extends string> {
  id: string;
  path: Path;
  clusterFrame: boolean;
  isEnabled: IComputedValue<boolean>;
  extension?: LensRendererExtension;
}

export interface RouteOptions<Path extends string> {
  id: string;
  path: Path | ((di: DiContainerForInjection) => Path);
  clusterFrame: boolean;
  /**
   * defaults to `true`
   */
  isEnabled?: IComputedValue<boolean> | ((di: DiContainerForInjection) => IComputedValue<boolean>);
  extension?: LensRendererExtension;
}

export const getFrontEndRouteInjectable = <Path extends string>({
  id,
  path,
  isEnabled,
  ...rest
}: RouteOptions<Path>) => getInjectable({
    id,
    instantiate: (di) => ({
      ...rest,
      id,
      path: isString(path)
        ? path
        : path(di),
      isEnabled: isFunction(isEnabled)
        ? isEnabled(di)
        : isEnabled ?? computed(() => true),
    }),
    injectionToken: frontEndRouteInjectionToken,
  });
