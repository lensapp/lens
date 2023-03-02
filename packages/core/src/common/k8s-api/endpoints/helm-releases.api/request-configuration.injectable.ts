/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

export type RequestHelmReleaseConfiguration = (
  name: string,
  namespace: string,
  all: boolean
) => Promise<string>;

const requestConfigurationEnpoint = urlBuilderFor("/v2/releases/:namespace/:name/values");

const requestHelmReleaseConfigurationInjectable = getInjectable({
  id: "request-helm-release-configuration",

  instantiate: (di): RequestHelmReleaseConfiguration => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, namespace, all: boolean) => (
      apiBase.get(requestConfigurationEnpoint.compile({ name, namespace }, { all }))
    );
  },
});

export default requestHelmReleaseConfigurationInjectable;
