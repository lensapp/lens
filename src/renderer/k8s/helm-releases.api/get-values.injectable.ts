/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { buildURLPositional } from "../../../common/utils/buildUrl";
import apiBaseInjectable from "../api-base.injectable";

export type GetHelmReleaseValues = (name: string, namespace: string, all?: boolean) => Promise<string>;

const getHelmReleaseValuesUrl = buildURLPositional<
  { namespace: string; name: string },
  { all?: boolean }
>("/v2/releases/:namespace/:name/values");

const getHelmReleaseValuesInjectable = getInjectable({
  id: "get-helm-release-values",
  instantiate: (di): GetHelmReleaseValues => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace, all) => apiBase.get(getHelmReleaseValuesUrl(
      { name, namespace },
      { all },
    ));
  },
});

export default getHelmReleaseValuesInjectable;
