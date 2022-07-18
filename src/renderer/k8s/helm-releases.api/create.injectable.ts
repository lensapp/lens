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


export interface HelmReleaseCreateDetails {
  log: string;
  release: HelmReleaseDetails;
}
export interface HelmReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}
export type CreateHelmRelease = (payload: HelmReleaseCreatePayload) => Promise<HelmReleaseCreateDetails>;

const createHelmReleaseInjectable = getInjectable({
  id: "create-helm-release",
  instantiate: (di): CreateHelmRelease => {
    const apiBase = di.inject(apiBaseInjectable);
    const releases = di.inject(releasesInjectable);

    return async ({ repo, chart, values, ...data }) => {
      const result = await apiBase.post(helmReleasesUrl(), {
        data: {
          chart: `${repo}/${chart}`,
          values: load(values),
          ...data,
        },
      }) as HelmReleaseCreateDetails;

      releases.invalidate();

      return result;
    };
  },
});

export default createHelmReleaseInjectable;
