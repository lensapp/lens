/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SemVer } from "semver";
import semver, { coerce } from "semver";
import * as iter from "./iter";
import type { RawHelmChart } from "../k8s-api/endpoints/helm-charts.api";
import logger from "../logger";

export enum Ordering {
  LESS = -1,
  EQUAL = 0,
  GREATER = 1,
}

/**
 * This function switches the direction of `ordering` if `direction` is `"desc"`
 * @param ordering The original ordering (assumed to be an "asc" ordering)
 * @param direction The new desired direction
 */
export function rectifyOrdering(ordering: Ordering, direction: "asc" | "desc"): Ordering {
  if (direction === "desc") {
    return -ordering;
  }

  return ordering;
}

/**
 * An ascending sorting function
 * @param left An item from an array
 * @param right An item from an array
 * @returns The relative ordering in an ascending manner.
 * - Less if left < right
 * - Equal if left == right
 * - Greater if left > right
 */
export function sortCompare<T>(left: T, right: T): Ordering {
  if (left < right) {
    return Ordering.LESS;
  }

  if (left === right) {
    return Ordering.EQUAL;
  }

  return Ordering.GREATER;
}

interface ChartVersion {
  version: string;
  __version?: SemVer | null;
}

export function sortCompareChartVersions(left: ChartVersion, right: ChartVersion): Ordering {
  if (left.__version && right.__version) {
    return semver.compare(right.__version, left.__version);
  }

  if (!left.__version && right.__version) {
    return Ordering.GREATER;
  }

  if (left.__version && !right.__version) {
    return Ordering.LESS;
  }

  return sortCompare(left.version, right.version);
}



export function sortCharts(charts: RawHelmChart[]) {
  interface ExtendedHelmChart extends RawHelmChart {
    __version?: SemVer | null;
  }

  const chartsWithVersion = Array.from(
    iter.map(
      charts,
      chart => {
        const __version = coerce(chart.version, { includePrerelease: true, loose: true });

        if (!__version) {
          logger.warn(`[HELM-SERVICE]: Version from helm chart is not loosely coercable to semver.`, { name: chart.name, version: chart.version, repo: chart.repo });
        }

        (chart as ExtendedHelmChart).__version = __version;

        return chart as ExtendedHelmChart;
      },
    ),
  );

  return chartsWithVersion
    .sort(sortCompareChartVersions)
    .map(chart => (delete chart.__version, chart as RawHelmChart));
}
