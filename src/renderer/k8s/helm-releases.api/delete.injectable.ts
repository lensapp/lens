/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonApiData } from "../../../common/k8s-api/json-api";
import releasesInjectable from "../../components/+helm-releases/releases.injectable";
import apiBaseInjectable from "../api-base.injectable";
import { helmReleasesUrl } from "../helm-releases.api";

export type DeleteHelmRelease = (name: string, namespace: string) => Promise<JsonApiData>;

const deleteHelmReleaseInjectable = getInjectable({
  id: "delete-helm-release",
  instantiate: (di): DeleteHelmRelease => {
    const apiBase = di.inject(apiBaseInjectable);
    const releases = di.inject(releasesInjectable);

    return async (name, namespace) => {
      const result = await apiBase.del(helmReleasesUrl({ name, namespace }));

      releases.invalidate();

      return result;
    };
  },
});

export default deleteHelmReleaseInjectable;
