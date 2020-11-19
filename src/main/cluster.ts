import type { ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import type { WorkspaceId } from "../common/workspace-store";
import { action, computed, observable, toJS, when } from "mobx";
import { broadcastMessage } from "../common/ipc";
import { KubeConfig } from "@kubernetes/client-node";
import { Kubectl } from "./kubectl";
import { loadConfig } from "../common/kube-helpers"
import logger from "./logger";

export enum ClusterMetadataKey {
  VERSION = "version",
  CLUSTER_ID = "id",
  DISTRIBUTION = "distribution",
  NODES_COUNT = "nodes",
  LAST_SEEN = "lastSeen"
}

export interface ClusterState {
  initialized: boolean;
  apiUrl: string;
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  ready: boolean;
  failureReason: string;
  eventCount: number;
  isAdmin: boolean;
  allowedNamespaces: string[]
  allowedResources: string[]
}

export class Cluster implements ClusterModel, ClusterState {
  public id: ClusterId;
  public kubeCtl: Kubectl
  public ownerRef: string;

  whenInitialized = when(() => this.initialized);
  whenReady = when(() => this.ready);

  @observable initialized = false;
  @observable contextName: string;
  @observable workspace: WorkspaceId;
  @observable kubeConfigPath: string;
  @observable apiUrl: string; // cluster server url
  @observable kubeProxyUrl: string; // lens-proxy to kube-api url
  @observable enabled = false; // only enabled clusters are visible to users
  @observable online = false; // describes if we can detect that cluster is online
  @observable accessible = false; // if user is able to access cluster resources
  @observable ready = false; // cluster is in usable state
  @observable reconnecting = false;
  @observable disconnected = true; // false if user has selected to connect
  @observable failureReason: string;
  @observable isAdmin = false;
  @observable eventCount = 0;
  @observable preferences: ClusterPreferences = {};
  @observable metadata: ClusterMetadata = {};
  @observable allowedNamespaces: string[] = [];
  @observable allowedResources: string[] = [];
  @observable accessibleNamespaces: string[] = [];

  @computed get available() {
    return this.accessible && !this.disconnected;
  }

  @computed get name() {
    return this.preferences.clusterName || this.contextName
  }

  get version(): string {
    return String(this.metadata?.version) || ""
  }

  constructor(model: ClusterModel) {
    this.updateModel(model);
    const kubeconfig = this.getKubeconfig()
    if (kubeconfig.getContextObject(this.contextName)) {
      this.apiUrl = kubeconfig.getCluster(kubeconfig.getContextObject(this.contextName).cluster).server
    }
  }

  get isManaged(): boolean {
    return !!this.ownerRef
  }

  @action
  updateModel(model: ClusterModel) {
    Object.assign(this, model);
  }

  protected getKubeconfig(): KubeConfig {
    return loadConfig(this.kubeConfigPath);
  }

  toJSON(): ClusterModel {
    const model: ClusterModel = {
      id: this.id,
      contextName: this.contextName,
      kubeConfigPath: this.kubeConfigPath,
      workspace: this.workspace,
      preferences: this.preferences,
      metadata: this.metadata,
      ownerRef: this.ownerRef,
      accessibleNamespaces: this.accessibleNamespaces,
    };
    return toJS(model, {
      recurseEverything: true
    })
  }

  // serializable cluster-state used for sync btw main <-> renderer
  getState(): ClusterState {
    const state: ClusterState = {
      initialized: this.initialized,
      apiUrl: this.apiUrl,
      online: this.online,
      ready: this.ready,
      disconnected: this.disconnected,
      accessible: this.accessible,
      failureReason: this.failureReason,
      isAdmin: this.isAdmin,
      eventCount: this.eventCount,
      allowedNamespaces: this.allowedNamespaces,
      allowedResources: this.allowedResources,
    };
    return toJS(state, {
      recurseEverything: true
    })
  }

  @action
  setState(state: ClusterState) {
    Object.assign(this, state)
  }

  pushState(state = this.getState()) {
    logger.silly(`[CLUSTER]: push-state`, state);
    broadcastMessage("cluster:state", this.id, state)
  }

  // get cluster system meta, e.g. use in "logger"
  getMeta() {
    return {
      id: this.id,
      name: this.contextName,
      initialized: this.initialized,
      ready: this.ready,
      online: this.online,
      accessible: this.accessible,
      disconnected: this.disconnected,
    }
  }
}
