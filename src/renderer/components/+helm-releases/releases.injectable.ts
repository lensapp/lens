/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import releaseSecretsInjectable from "./release-secrets.injectable";
import callForHelmReleasesInjectable from "./call-for-helm-releases/call-for-helm-releases.injectable";
import type { HelmRelease, HelmReleaseDto } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { formatDuration } from "../../../common/utils";
import { helmChartStore } from "../+helm-charts/helm-chart.store";
import { capitalize } from "lodash/fp";

const releasesInjectable = getInjectable({
  id: "releases",

  instantiate: (di) => {
    const clusterContext = di.inject(clusterFrameContextInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const releaseSecrets = di.inject(releaseSecretsInjectable);
    const callForHelmReleases = di.inject(callForHelmReleasesInjectable);

    return asyncComputed(async () => {
      const contextNamespaces = namespaceStore.contextNamespaces || [];

      void releaseSecrets.get();

      const isLoadingAll =
        clusterContext.allNamespaces?.length > 1 &&
        clusterContext.cluster?.accessibleNamespaces.length === 0 &&
        clusterContext.allNamespaces.every((namespace) =>
          contextNamespaces.includes(namespace),
        );

      const releaseArrays = await (isLoadingAll ? callForHelmReleases() : Promise.all(
        contextNamespaces.map((namespace) =>
          callForHelmReleases(namespace),
        ),
      ));

      return releaseArrays.flat().map(toHelmRelease);
    }, []);
  },
});

export const toHelmRelease = (release: HelmReleaseDto) : HelmRelease => ({
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


export default releasesInjectable;
