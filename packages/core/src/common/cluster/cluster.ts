/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, toJS, runInAction } from "mobx";
import type { KubeApiResource } from "../rbac";
import type { ClusterState, ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences, ClusterPrometheusPreferences, UpdateClusterModel } from "../cluster-types";
import { ClusterMetadataKey, clusterModelIdChecker, updateClusterModelChecker } from "../cluster-types";
import type { IObservableValue } from "mobx";
import { replaceObservableObject } from "../utils/replace-observable-object";
import { pick } from "lodash";

export class Cluster {
  /**
   * Unique id for a cluster
   */
  readonly id: ClusterId;

  /**
   * Kubeconfig context name
   */
  readonly contextName = observable.box() as IObservableValue<string>;

  /**
   * Path to kubeconfig
   */
  readonly kubeConfigPath = observable.box() as IObservableValue<string>;

  /**
   * Describes if we can detect that cluster is online
   */
  readonly online = observable.box(false);

  /**
   * Describes if user is able to access cluster resources
   */
  readonly accessible = observable.box(false);

  /**
   * Is cluster instance in usable state
   */
  readonly ready = observable.box(false);

  /**
   * Is cluster disconnected. False if user has selected to connect.
   */
  readonly disconnected = observable.box(true);

  /**
   * Does user have admin like access
   */
  readonly isAdmin = observable.box(false);

  /**
   * Global watch-api accessibility , e.g. "/api/v1/services?watch=1"
   */
  readonly isGlobalWatchEnabled = observable.box(false);

  /**
   * Preferences
   */
  readonly preferences = observable.object<ClusterPreferences>({});

  /**
   * Metadata
   */
  readonly metadata = observable.object<ClusterMetadata>({});

  /**
   * List of allowed namespaces verified via K8S::SelfSubjectAccessReview api
   */
  readonly allowedNamespaces = observable.array<string>();

  /**
   * List of accessible namespaces provided by user in the Cluster Settings
   */
  readonly accessibleNamespaces = observable.array<string>();

  /**
   * The list of all known resources associated with this cluster
   */
  readonly knownResources = observable.array<KubeApiResource>();

  /**
   * The formatting of this is `group.name` or `name` (if in core)
   */
  readonly resourcesToShow = observable.set<string>();

  /**
   * Labels for the catalog entity
   */
  readonly labels = observable.object<Partial<Record<string, string>>>({});

  /**
   * Is cluster available
   */
  readonly available = computed(() => this.accessible.get() && !this.disconnected.get());

  /**
   * Cluster name
   */
  readonly name = computed(() => this.preferences.clusterName || this.contextName.get());

  /**
   * The detected kubernetes distribution
   */
  readonly distribution = computed(() => this.metadata[ClusterMetadataKey.DISTRIBUTION]?.toString() || "unknown");

  /**
   * The detected kubernetes version
   */
  readonly version = computed(() => this.metadata[ClusterMetadataKey.VERSION]?.toString() || "unknown");

  /**
   * Prometheus preferences
   */
  readonly prometheusPreferences = computed(() => pick(toJS(this.preferences), "prometheus", "prometheusProvider") as ClusterPrometheusPreferences);

  constructor({ id, ...model }: ClusterModel) {
    const { error } = clusterModelIdChecker.validate({ id });

    if (error) {
      throw error;
    }

    this.id = id;
    this.updateModel(model);
  }

  /**
   * Update cluster data model
   *
   * @param model
   */
  updateModel(model: UpdateClusterModel) {
    // Note: do not assign ID as that should never be updated

    const { error } = updateClusterModelChecker.validate(model, { allowUnknown: true });

    if (error) {
      throw error;
    }

    runInAction(() => {
      this.kubeConfigPath.set(model.kubeConfigPath);
      this.contextName.set(model.contextName);

      if (model.preferences) {
        replaceObservableObject(this.preferences, model.preferences);
      }

      if (model.metadata) {
        replaceObservableObject(this.metadata, model.metadata);
      }

      if (model.accessibleNamespaces) {
        this.accessibleNamespaces.replace(model.accessibleNamespaces);
      }

      if (model.labels) {
        replaceObservableObject(this.labels, model.labels);
      }
    });
  }

  toJSON(): ClusterModel {
    return {
      id: this.id,
      contextName: this.contextName.get(),
      kubeConfigPath: this.kubeConfigPath.get(),
      preferences: toJS(this.preferences),
      metadata: toJS(this.metadata),
      accessibleNamespaces: this.accessibleNamespaces.toJSON(),
      labels: toJS(this.labels),
    };
  }

  /**
   * Serializable cluster-state used for sync btw main <-> renderer
   */
  getState(): ClusterState {
    return {
      online: this.online.get(),
      ready: this.ready.get(),
      disconnected: this.disconnected.get(),
      accessible: this.accessible.get(),
      isAdmin: this.isAdmin.get(),
      allowedNamespaces: this.allowedNamespaces.toJSON(),
      resourcesToShow: this.resourcesToShow.toJSON(),
      isGlobalWatchEnabled: this.isGlobalWatchEnabled.get(),
    };
  }

  /**
   * @param state cluster state
   */
  setState(state: ClusterState) {
    runInAction(() => {
      this.accessible.set(state.accessible);
      this.allowedNamespaces.replace(state.allowedNamespaces);
      this.resourcesToShow.replace(state.resourcesToShow);
      this.disconnected.set(state.disconnected);
      this.isAdmin.set(state.isAdmin);
      this.isGlobalWatchEnabled.set(state.isGlobalWatchEnabled);
      this.online.set(state.online);
      this.ready.set(state.ready);
    });
  }

  // get cluster system meta, e.g. use in "logger"
  getMeta() {
    return {
      id: this.id,
      name: this.contextName.get(),
      ready: this.ready.get(),
      online: this.online.get(),
      accessible: this.accessible.get(),
      disconnected: this.disconnected.get(),
    };
  }
}
