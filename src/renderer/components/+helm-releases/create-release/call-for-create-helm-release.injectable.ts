/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import yaml from "js-yaml";
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { endpoint } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { apiBase } from "../../../../common/k8s-api";

interface HelmReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}

export type CallForCreateHelmRelease = (
  payload: HelmReleaseCreatePayload
) => Promise<HelmReleaseUpdateDetails>;

const callForCreateHelmReleaseInjectable = getInjectable({
  id: "call-for-create-helm-release",

  instantiate: (): CallForCreateHelmRelease => (payload) => {
    const { repo, chart: rawChart, values: rawValues, ...data } = payload;
    const chart = `${repo}/${rawChart}`;
    const values = yaml.load(rawValues);

    return apiBase.post(endpoint(), {
      data: {
        chart,
        values,
        ...data,
      },
    });
  },

  causesSideEffects: true,
});

export default callForCreateHelmReleaseInjectable;
