/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import type { FallthroughPageParamDeclaration, PageParamDeclaration, PageParamInit } from "../navigation/page-param";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import { map } from "lodash/fp";
import createPageParamInjectable from "../navigation/create-page-param.injectable";
import { isString, object } from "@k8slens/utilities";
import type { PageParams, PageRegistration } from "./page-registration";

export interface ExtensionPageParametersInstantiationParam<Params> {
  extension: LensRendererExtension;
  registration: PageRegistration<Params>;
}

const extensionPageParametersInjectable = getInjectable({
  id: "extension-page-parameters",

  instantiate: (di, { registration }) => {
    const createPageParam = di.inject(createPageParamInjectable);

    return pipeline(
      object.entries((registration.params ?? {}) as PageParams<string | PageParamDeclaration<unknown>>),
      map(([key, value]) => [
        key,
        isString(value)
          ? createPageParam(convertStringToPageParamInit(key, value))
          : createPageParam(convertPartialPageParamInitToFull(key, value)),
      ] as const),
      object.fromEntries,
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (
      di,
      { extension, registration }: ExtensionPageParametersInstantiationParam<unknown>,
    ) => `${extension.sanitizedExtensionId}-${registration?.id ?? ""}`,
  }),
});

const convertPartialPageParamInitToFull = (key: string, value: FallthroughPageParamDeclaration) => ({
  name: key,
  defaultValue: value.defaultValue,
  stringify: value.stringify,
  parse: value.parse,
}) as PageParamInit<unknown>;

const convertStringToPageParamInit = (
  key: string,
  value: string,
): PageParamInit<unknown> => ({
  name: key,
  defaultValue: value,
});

export default extensionPageParametersInjectable;
