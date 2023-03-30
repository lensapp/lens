/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Cluster } from "../../../../../common/cluster/cluster";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import enabledMetricsInjectable from "../metrics-enabled.injectable";
import activeEntityInternalClusterInjectable from "../get-active-cluster-entity.injectable";
import { observable } from "mobx";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import type { DiContainer } from "@ogre-tools/injectable";

describe("metrics-enabled", () => {
  let cluster: Cluster;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    cluster = new Cluster({ contextName: "irrelevant", id: "irrelevant", kubeConfigPath: "irrelevant" });
    const observableCluster = observable.box(cluster);

    di.override(activeEntityInternalClusterInjectable, () => observableCluster);
  });

  it("given cluster has no hidden metrics preferences, should be true for all resources", () => {
    const resourceTypes = Object.values(ClusterMetricsResourceType);

    delete cluster.preferences.hiddenMetrics;
    resourceTypes.forEach((resourceType) => {
      expect(di.inject(enabledMetricsInjectable, resourceType).get()).toBe(true);
    });
  });

  it("given cluster has metrics preferences, but nothing is hidden, should be true for all resources", () => {
    const resourceTypes = Object.values(ClusterMetricsResourceType);

    cluster.preferences.hiddenMetrics = [];

    resourceTypes.forEach((resourceType) => {
      expect(di.inject(enabledMetricsInjectable, resourceType).get()).toBe(true);
    });
  });

  it("given cluster has metrics preferences, and some resource is hidden, should be false", () => {
    cluster.preferences.hiddenMetrics = [ClusterMetricsResourceType.Pod];

    expect(di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.Pod).get()).toBe(false);
  });
});

