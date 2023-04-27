/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObjectMetadata, KubeObjectScope, KubeJsonApiData } from "@k8slens/kube-object";
import { KubeObject } from "@k8slens/kube-object";
import type { AsyncResult } from "@k8slens/utilities";
import { getErrorMessage } from "../../../../../common/utils/get-error-message";
import type { Writable } from "type-fest";
import { parseKubeApi } from "../../../../../common/k8s-api/kube-api-parse";
import apiKubeGetInjectable from "../../../../k8s/api-kube-get.injectable";

export type RequestKubeResource = (selfLink: string) => AsyncResult<KubeObject | undefined>;

const requestKubeResourceInjectable = getInjectable({
  id: "request-kube-resource",

  instantiate: (di): RequestKubeResource => {
    const apiKubeGet = di.inject(apiKubeGetInjectable);

    return async (selfLink) => {
      const parsed = parseKubeApi(selfLink);

      if (!parsed?.name) {
        return { callWasSuccessful: false, error: "Invalid API path" };
      }

      try {
        const rawData = await apiKubeGet(selfLink) as KubeJsonApiData<KubeObjectMetadata<KubeObjectScope>, unknown, unknown>;

        (rawData.metadata as Writable<typeof rawData.metadata>).selfLink = selfLink;

        return {
          callWasSuccessful: true,
          response: new KubeObject(rawData),
        };
      } catch (e) {
        return { callWasSuccessful: false, error: getErrorMessage(e) };
      }
    };
  },
});

export default requestKubeResourceInjectable;
