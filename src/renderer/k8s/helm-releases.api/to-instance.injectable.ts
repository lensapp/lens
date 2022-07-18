/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { capitalize } from "lodash/fp";
import helmChartStoreInjectable from "../../components/+helm-charts/store.injectable";
import { formatDuration } from "../../utils";
import type { HelmRelease, RawHelmRelease } from "../helm-release";

export type ToHelmRelease = (raw: RawHelmRelease) => HelmRelease;

const toHelmReleaseInjectable = getInjectable({
  id: "to-helm-release",
  instantiate: (di): ToHelmRelease => {
    const helmChartStore = di.inject(helmChartStoreInjectable);

    return (release) => ({
      ...release,

      getId() {
        return this.namespace + this.name;
      },

      getName() {
        return this.name;
      },

      getNs() {
        return this.namespace;
      },

      getChart(withVersion = false) {
        let chart = this.chart;

        if (!withVersion && this.getVersion() != "") {
          const search = new RegExp(`-${this.getVersion()}`);

          chart = chart.replace(search, "");
        }

        return chart;
      },

      getRevision() {
        return parseInt(this.revision, 10);
      },

      getStatus() {
        return capitalize(this.status);
      },

      getVersion() {
        const versions = this.chart.match(/(?<=-)(v?\d+)[^-].*$/);

        return versions?.[0] ?? "";
      },

      getUpdated(humanize = true, compact = true) {
        const updated = this.updated.replace(/\s\w*$/, ""); // 2019-11-26 10:58:09 +0300 MSK -> 2019-11-26 10:58:09 +0300 to pass into Date()
        const updatedDate = new Date(updated).getTime();
        const diff = Date.now() - updatedDate;

        if (humanize) {
          return formatDuration(diff, compact);
        }

        return diff;
      },

      // Helm does not store from what repository the release is installed,
      // so we have to try to guess it by searching charts
      async getRepo() {
        const chartName = this.getChart();
        const version = this.getVersion();
        const versions = await helmChartStore.getVersions(chartName);
        const chartVersion = versions.find(
          (chartVersion) => chartVersion.version === version,
        );

        return chartVersion ? chartVersion.repo : "";
      },
    });
  },
});

export default toHelmReleaseInjectable;
