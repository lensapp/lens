/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

export type RequestHelmReleaseValues = (name: string, namespace: string, all?: boolean) => Promise<string>;

const requestValuesEndpoint = urlBuilderFor("/v2/release/:namespace/:name/values");

const requestHelmReleaseValuesInjectable = getInjectable({
  id: "request-helm-release-values",
  instantiate: (di): RequestHelmReleaseValues => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace, all) => apiBase.get(requestValuesEndpoint.compile({ name, namespace }, { all }));
  },
});

export default requestHelmReleaseValuesInjectable;
