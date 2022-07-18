/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { load } from "js-yaml";
import releasesInjectable from "../../components/+helm-releases/releases.injectable";
import apiBaseInjectable from "../api-base.injectable";
import type { HelmReleaseDetails } from "../helm-releases.api";
import { helmReleasesUrl } from "../helm-releases.api";

export interface HelmReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export interface HelmReleaseUpdateDetails {
  log: string;
  release: HelmReleaseDetails;
}

export type UpdateHelmRelease = (name: string, namespace: string, payload: HelmReleaseUpdatePayload) => Promise<HelmReleaseUpdateDetails>;

const updateHelmReleaseInjectable = getInjectable({
  id: "update-helm-release",
  instantiate: (di): UpdateHelmRelease => {
    const apiBase = di.inject(apiBaseInjectable);
    const releases = di.inject(releasesInjectable);

    return async (name, namespace, { repo, chart, values, ...data }) => {
      const result = await apiBase.put(helmReleasesUrl({ name, namespace }), {
        data: {
          chart: `${repo}/${chart}`,
          values: load(values),
          ...data,
        },
      }) as HelmReleaseUpdateDetails;

      releases.invalidate();

      return result;
    };
  },
});

export default updateHelmReleaseInjectable;
