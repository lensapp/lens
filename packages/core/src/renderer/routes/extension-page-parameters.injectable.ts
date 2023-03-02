/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import type { PageParamInit } from "../navigation/page-param";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import { map } from "lodash/fp";
import createPageParamInjectable from "../navigation/create-page-param.injectable";
import { object } from "@k8slens/utilities";
import type { PageRegistration } from "./page-registration";

export interface ExtensionPageParametersInstantiationParam {
  extension: LensRendererExtension;
  registration: PageRegistration;
}

const extensionPageParametersInjectable = getInjectable({
  id: "extension-page-parameters",

  instantiate: (di, { registration }: ExtensionPageParametersInstantiationParam) => {
    const createPageParam = di.inject(createPageParamInjectable);

    return pipeline(
      registration.params ?? {},
      Object.entries,
      map(([key, value]): [string, PageParamInit<unknown>] => [
        key,
        typeof value === "string"
          ? convertStringToPageParamInit(key, value)
          : convertPartialPageParamInitToFull(key, value),
      ]),
      map(([key, value]) => [key, createPageParam(value)] as const),
      object.fromEntries,
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (
      di,
      { extension, registration }: ExtensionPageParametersInstantiationParam,
    ) => `${extension.sanitizedExtensionId}-${registration?.id}`,
  }),
});

const convertPartialPageParamInitToFull = <V>(
  key: string,
  value: PageParamInit<V>,
): PageParamInit<V> => ({
    name: key,
    defaultValue: value.defaultValue,
    stringify: value.stringify,
    parse: value.parse,
  });

const convertStringToPageParamInit = (
  key: string,
  value: string,
): PageParamInit<string> => ({
  name: key,
  defaultValue: value,
});

export default extensionPageParametersInjectable;
