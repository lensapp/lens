/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../../../../common/k8s-api";
import { endpoint } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import yaml from "js-yaml";

interface HelmReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export type CallForHelmReleaseUpdate = (
  name: string,
  namespace: string,
  payload: HelmReleaseUpdatePayload
) => Promise<{ updateWasSuccessful: true } | { updateWasSuccessful: false; error: unknown }>;

const callForHelmReleaseUpdateInjectable = getInjectable({
  id: "call-for-helm-release-update",

  instantiate:
    (): CallForHelmReleaseUpdate => async (name, namespace, payload) => {
      const { repo, chart: rawChart, values: rawValues, ...data } = payload;
      const chart = `${repo}/${rawChart}`;
      const values = yaml.load(rawValues);

      try {
        await apiBase.put(endpoint({ name, namespace }), {
          data: {
            chart,
            values,
            ...data,
          },
        });
      } catch (e) {
        return { updateWasSuccessful: false, error: e };
      }

      return { updateWasSuccessful: true };
    },

  causesSideEffects: true,
});

export default callForHelmReleaseUpdateInjectable;
