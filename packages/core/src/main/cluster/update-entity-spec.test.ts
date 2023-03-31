/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AppPaths } from "../../common/app-paths/app-path-injection-token";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { KubernetesCluster } from "../../common/catalog-entities";
import { Cluster } from "../../common/cluster/cluster";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { UpdateEntitySpec } from "./update-entity-spec.injectable";
import updateEntitySpecInjectable from "./update-entity-spec.injectable";

describe("update-entity-spec", () => {
  let cluster: Cluster;
  let entity: KubernetesCluster;
  let updateEntitySpec: UpdateEntitySpec;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(appPathsStateInjectable, () => ({
      get: () => ({} as AppPaths),
      set: () => {},
    }));

    updateEntitySpec = di.inject(updateEntitySpecInjectable);

    cluster = new Cluster({
      id: "some-id",
      contextName: "some-context",
      kubeConfigPath: "minikube-config.yml",
    });

    entity = new KubernetesCluster({
      metadata: {
        uid: "some-uid",
        name: "some-name",
        labels: {},
      },
      spec: {
        kubeconfigContext: "some-context",
        kubeconfigPath: "/some/path/to/kubeconfig",
      },
      status: {
        phase: "connecting",
      },
    });
  });

  it("given cluster has icon, updates entity spec with icon", () => {
    cluster.preferences.icon = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";
    updateEntitySpec(entity, cluster);
    expect(entity.spec.icon?.src).toEqual("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/");
  });

  it("given cluster has custom icon background color set, updates entity spec with icon", () => {
    cluster.preferences.icon = "#ff0000";
    updateEntitySpec(entity, cluster);
    expect(entity.spec.icon?.background).toEqual("#ff0000");
  });

  it("given cluster has custom icon background color set, does not update entity icon src", () => {
    cluster.preferences.icon = "#ff0000";
    updateEntitySpec(entity, cluster);
    expect(entity.spec.icon?.src).toBeUndefined();
  });

  it("given cluster icon is null, deletes icon from both", () => {
    cluster.preferences.icon = null;
    entity.spec.icon = { src : "some-icon" };

    updateEntitySpec(entity, cluster);
    expect(entity.spec.icon).toBeUndefined();
    expect(cluster.preferences.icon).toBeUndefined();
  });

  it("given entity has no metrics, adds source as local", () => {
    updateEntitySpec(entity, cluster);
    expect(entity.spec.metrics?.source).toEqual("local");
  });

  it("given entity has metrics, does not change source", () => {
    entity.spec.metrics = { source: "some-source" };
    entity.spec.metrics.prometheus = {
      address: {
        namespace: "some-namespace",
        port: 42,
        service: "some-service",
        prefix: "some-prefix",
      },
    };

    cluster.preferences.prometheus = {
      namespace: "some-other-namespace",
      port: 666,
      service: "some-other-service",
      prefix: "some-other-prefix",
    };

    updateEntitySpec(entity, cluster);

    expect(entity.spec.metrics?.source).toEqual("some-source");
    expect(entity.spec.metrics?.prometheus?.address).toEqual({
      namespace: "some-namespace",
      port: 42,
      service: "some-service",
      prefix: "some-prefix",
    });
  });

  it("given entity has local prometheus source, updates entity spec with prometheus provider", () => {
    entity.spec.metrics = { source: "local" };

    cluster.preferences.prometheusProvider = {
      type: "some-prometheus-provider-type",
    };
    cluster.preferences.prometheus = {
      namespace: "some-namespace",
      port: 42,
      service: "some-service",
      prefix: "some-prefix",
    };

    updateEntitySpec(entity, cluster);
    expect(entity.spec.metrics?.prometheus?.address).toEqual({
      namespace: "some-namespace",
      port: 42,
      service: "some-service",
      prefix: "some-prefix",
    });

    expect(entity.spec.metrics?.prometheus?.type).toEqual("some-prometheus-provider-type");
  });

  it("given entity has no metrics, updates entity spec with prometheus provider", () => {
    expect(entity.spec.metrics).toBeUndefined();

    cluster.preferences.prometheusProvider = {
      type: "some-prometheus-provider-type",
    };
    cluster.preferences.prometheus = {
      namespace: "some-namespace",
      port: 42,
      service: "some-service",
      prefix: "some-prefix",
    };

    updateEntitySpec(entity, cluster);

    expect(entity.spec.metrics?.prometheus?.address).toEqual({
      namespace: "some-namespace",
      port: 42,
      service: "some-service",
      prefix: "some-prefix",
    });

    expect(entity.spec.metrics?.prometheus?.type).toEqual("some-prometheus-provider-type");
  });

});
