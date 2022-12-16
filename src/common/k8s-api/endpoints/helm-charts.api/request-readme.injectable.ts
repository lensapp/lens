/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor } from "../../../utils/buildUrl";
import apiBaseInjectable from "../../api-base.injectable";

const requestReadmeEndpoint = urlBuilderFor("/v2/charts/:repo/:name/readme");

export type RequestHelmChartReadme = (repo: string, name: string, version?: string) => Promise<string>;

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
