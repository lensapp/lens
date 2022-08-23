/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../../../../../common/k8s-api";
import { endpoint } from "../../../../../../common/k8s-api/endpoints/helm-releases.api";

export type CallForHelmReleaseConfiguration = (
  name: string,
  namespace: string,
  all: boolean
) => Promise<string>;

const callForHelmReleaseConfigurationInjectable = getInjectable({
  id: "call-for-helm-release-configuration",

  instantiate:
    (): CallForHelmReleaseConfiguration => async (name, namespace, all: boolean) => {
      const route = "values";
      const path = endpoint({ name, namespace, route }, { all });

      return apiBase.get<string>(path);
    },

  causesSideEffects: true,
});

export default callForHelmReleaseConfigurationInjectable;
