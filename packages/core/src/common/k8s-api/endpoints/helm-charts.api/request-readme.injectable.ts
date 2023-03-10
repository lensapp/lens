/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { urlBuilderFor } from "@k8slens/utilities";
import apiBaseInjectable from "../../api-base.injectable";

const requestReadmeEndpoint = urlBuilderFor("/v2/charts/:repo/:name/readme");

export type RequestHelmChartReadme = (repo: string, name: string, version?: string) => AsyncResult<string>;

const requestHelmChartReadmeInjectable = getInjectable({
  id: "request-helm-chart-readme",
  instantiate: (di): RequestHelmChartReadme => {
    const apiBase = di.inject(apiBaseInjectable);

    return (repo, name, version) => (
      apiBase.get(requestReadmeEndpoint.compile({ name, repo }, { version }))
    );
  },
});

export default requestHelmChartReadmeInjectable;
