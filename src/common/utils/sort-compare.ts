/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import semver, { coerce, SemVer } from "semver";
import * as iter from "./iter";
import type { RawHelmChart } from "../k8s-api/endpoints/helm-charts.api";
import logger from "../logger";

export function sortCompare<T>(left: T, right: T): -1 | 0 | 1 {
  if (left < right) {
    return -1;
  }

  if (left === right) {
    return 0;
  }

  return 1;
}

interface ChartVersion {
  version: string;
  __version?: SemVer;
}

export function sortCompareChartVersions(left: ChartVersion, right: ChartVersion): -1 | 0 | 1 {
  if (left.__version && right.__version) {
    return semver.compare(right.__version, left.__version);
  }

  if (!left.__version && right.__version) {
    return 1;
  }

  if (left.__version && !right.__version) {
    return -1;
  }

  return sortCompare(left.version, right.version);
}



export function sortCharts(charts: RawHelmChart[]) {
  interface ExtendedHelmChart extends RawHelmChart {
    __version: SemVer;
  }

  const chartsWithVersion = Array.from(
    iter.map(
      charts,
      (chart => {
        const __version = coerce(chart.version, { includePrerelease: true, loose: true });

        if (!__version) {
          logger.warn(`[HELM-SERVICE]: Version from helm chart is not loosely coercable to semver.`, { name: chart.name, version: chart.version, repo: chart.repo });
        }

        (chart as ExtendedHelmChart).__version = __version;

        return chart as ExtendedHelmChart;
      })
    ),
  );

  return chartsWithVersion
    .sort(sortCompareChartVersions)
    .map(chart => (delete chart.__version, chart));
}
