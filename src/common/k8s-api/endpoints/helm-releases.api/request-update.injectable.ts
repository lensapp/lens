/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import yaml from "js-yaml";
import { apiBaseInjectionToken } from "../../api-base";
import { urlBuilderFor } from "../../../utils/buildUrl";

interface HelmReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export type RequestHelmReleaseUpdate = (
  name: string,
  namespace: string,
  payload: HelmReleaseUpdatePayload
) => Promise<{ updateWasSuccessful: true } | { updateWasSuccessful: false; error: unknown }>;

const requestUpdateEndpoint = urlBuilderFor("/v2/releases/:namespace/:name");

const requestHelmReleaseUpdateInjectable = getInjectable({
  id: "request-helm-release-update",

  instantiate: (di): RequestHelmReleaseUpdate => {
    const apiBase = di.inject(apiBaseInjectionToken);

    return async (name, namespace, { repo, chart, values, ...data }) => {
      try {
        await apiBase.put(requestUpdateEndpoint.compile({ name, namespace }), {
          data: {
            chart: `${repo}/${chart}`,
            values: yaml.load(values),
            ...data,
          },
        });
      } catch (e) {
        return { updateWasSuccessful: false, error: e };
      }

      return { updateWasSuccessful: true };
    };
  },
});

export default requestHelmReleaseUpdateInjectable;
