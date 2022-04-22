/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import type { PageParamInit } from "../navigation";
import { PageParam } from "../navigation";
import observableHistoryInjectable from "../navigation/history/observable.injectable";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import type { PageRegistration } from "../../extensions/registries";
import { fromPairs, map, toPairs } from "lodash/fp";

interface InstantiationParameter {
  extension: LensRendererExtension;
  registration: PageRegistration;
}

const extensionPageParametersInjectable = getInjectable({
  id: "extension-page-parameters",

  instantiate: (di, { registration }: InstantiationParameter) => {
    const observableHistory = di.inject(observableHistoryInjectable);

    return pipeline(
      registration.params ?? {},
      toPairs,
      map(([key, value]): [string, PageParamInit] => [
        key,
        typeof value === "string"
          ? convertStringToPageParamInit(key, value)
          : convertPartialPageParamInitToFull(key, value as PageParamInit),
      ]),
      map(([key, value]) => [key, new PageParam(value, observableHistory)]),
      fromPairs,
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (
      di,
      { extension, registration }: InstantiationParameter,
    ) => `${extension.sanitizedExtensionId}-${registration?.id}`,
  }),
});

const convertPartialPageParamInitToFull = (
  key: string,
  value: PageParamInit,
): PageParamInit => ({
  name: key,
  defaultValue: value.defaultValue,
  stringify: value.stringify,
  parse: value.parse,
});

const convertStringToPageParamInit = (
  key: string,
  value: string,
): PageParamInit => ({
  name: key,
  defaultValue: value,
});

export default extensionPageParametersInjectable;
