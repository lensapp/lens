/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { capitalize } from "lodash";
import { when } from "mobx";
import helmChartVersionsInjectable from "../+helm-charts/helm-charts/versions.injectable";
import type { HelmRelease, HelmReleaseDto } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { getMillisecondsFromUnixEpoch } from "../../../common/utils/date/get-current-date-time";
import { formatDuration } from "../../utils";

export type ToHelmRelease = (release: HelmReleaseDto) => HelmRelease;

const toHelmReleaseInjectable = getInjectable({
  id: "to-helm-release",
  instantiate: (di): ToHelmRelease => {
    const helmChartVersions = (release: HelmRelease) => di.inject(helmChartVersionsInjectable, release);

    return (release) => ({
      ...release,

      getId() {
        return `${this.namespace}/${this.name}`;
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
        const diff = getMillisecondsFromUnixEpoch() - updatedDate;

        if (humanize) {
          return formatDuration(diff, compact);
        }

        return diff;
      },

      // Helm does not store from what repository the release is installed,
      // so we have to try to guess it by searching charts
      async getRepo() {
        const versionsComputed = helmChartVersions(this);
        const version = this.getVersion();

        await when(() => !versionsComputed.pending.get());

        return versionsComputed.value
          .get()
          .find((chartVersion) => chartVersion.version === version)?.repo
          ?? "";
      },
    });
  },
});

export default toHelmReleaseInjectable;
