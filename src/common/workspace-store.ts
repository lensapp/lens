import { ipcRenderer } from "electron";
import { action, computed, observable, toJS, reaction } from "mobx";
import { BaseStore } from "./base-store";
import { clusterStore } from "./cluster-store";
import { appEventBus } from "./event-bus";
import { broadcastMessage, handleRequest, requestMain } from "../common/ipc";
import logger from "../main/logger";
import type { ClusterId } from "./cluster-store";
import { Cluster } from "../main/cluster";
import migrations from "../migrations/workspace-store";
import { clusterViewURL } from "../renderer/components/cluster-manager/cluster-view.route";

export type WorkspaceId = string;

export class InvariantError extends Error {}

export interface WorkspaceStoreModel {
  workspaces: WorkspaceModel[];
  currentWorkspace?: WorkspaceId;
}

export interface WorkspaceModel {
  id: WorkspaceId;
  name: string;
  description?: string;
  ownerRef?: string;
  activeClusterId?: ClusterId;
}

export interface WorkspaceState {
  enabled: boolean;
}

const updateFromModel = Symbol("updateFromModel");

/**
 * Workspace
 *
 * @beta
 */
export class Workspace implements WorkspaceModel, WorkspaceState {
  /**
   * Unique id for workspace
   *
   * @observable
   */
  @observable id: WorkspaceId;
  /**
   * Workspace name
   *
   * @observable
   */
  @observable name: string;
  /**
   * Workspace description
   *
   * @observable
   */
  @observable description?: string;
  /**
   * Workspace owner reference
   *
   * If extension sets ownerRef then it needs to explicitly mark workspace as enabled onActivate (or when workspace is saved)
   *
   * @observable
   */
  @observable ownerRef?: string;

  @observable private _enabled = false;

  /**
   * The active cluster within this workspace
   */
  #activeClusterId = observable.box<ClusterId | undefined>();

  get activeClusterId() {
    return this.#activeClusterId.get();
  }

  constructor(model: WorkspaceModel) {
    this[updateFromModel](model);

    if (!ipcRenderer) {
      reaction(() => this.getState(), () => {
        this.pushState();
      });
    }
  }

  /**
   * Is workspace enabled
   *
   * Workspaces that don't have ownerRef will be enabled by default. Workspaces with ownerRef need to explicitly enable a workspace.
   *
   * @computed
   */
  @computed get enabled(): boolean {
    return !this.isManaged || this._enabled;
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled;
  }

  /**
   * Is workspace managed by an extension
   *
   * @computed
   */
  @computed get isManaged(): boolean {
    return Boolean(this.ownerRef);
  }

  @computed get activeCluster(): Cluster | undefined {
    return clusterStore.getById(this.activeClusterId);
  }

  /**
   * Resolves the clusterId or cluster, checking some invariants
   * @param clusterOrId The ID or cluster object to resolve
   * @returns A Cluster instance of the specified cluster if it is in this workspace
   * @throws if provided a falsey value or if it is an unknown ClusterId or if
   * the cluster is not in this workspace.
   */
  private resolveClusterOrId(clusterOrId: ClusterId | Cluster): Cluster {
    if (!clusterOrId) {
      throw new InvariantError("Must provide a Cluster or a ClusterId");
    }

    const cluster = typeof clusterOrId === "string"
      ? clusterStore.getById(clusterOrId)
      : clusterOrId;

    if (!cluster) {
      throw new InvariantError(`ClusterId ${clusterOrId} is invalid`);
    }

    if (cluster.workspace !== this.id) {
      throw new InvariantError(`Cluster ${cluster.name} is not in Workspace ${this.name}`);
    }

    return cluster;
  }

  /**
   * Sets workspace's active cluster to resolved `clusterOrId`. As long as it
   * is valid
   * @param clusterOrId the cluster instance or its ID
   */
  @action setActiveCluster(clusterOrId?: ClusterId | Cluster) {
    try {
      if (clusterOrId === undefined) {
        this.#activeClusterId.set(undefined);
      } else {
        this.#activeClusterId.set(this.resolveClusterOrId(clusterOrId).id);
      }
    } catch (error) {
      logger.error("[WORKSPACE]: activeClusterId was attempted to be set to an invalid value", { error, workspaceName: this.name });
    }
  }

  /**
   * Tries to clear the cluster as this workspace's activeCluster.
   * @param clusterOrId the cluster instance or its ID
   * @returns true if it matches the `activeClusterId` (and is thus cleared) else false
   */
  @action tryClearAsActiveCluster(clusterOrId: ClusterId | Cluster): boolean {
    const clusterId = typeof clusterOrId === "string"
      ? clusterOrId
      : clusterOrId.id;

    const clearActive = this.activeClusterId === clusterId;

    if (clearActive) {
      this.clearActiveCluster();
    }

    return clearActive;
  }

  @action clearActiveCluster() {
    this.#activeClusterId.set(undefined);
  }

  /**
   * Get workspace state
   *
   */
  getState(): WorkspaceState {
    return toJS({
      enabled: this.enabled
    });
  }

  /**
   * Push state
   *
   * @internal
   * @param state workspace state
   */
  pushState(state = this.getState()) {
    logger.silly("[WORKSPACE] pushing state", {...state, id: this.id});
    broadcastMessage("workspace:state", this.id, toJS(state));
  }

  /**
   *
   * @param state workspace state
   */
  @action setState(state: WorkspaceState) {
    this.enabled = state.enabled;
  }

  [updateFromModel] = action((model: WorkspaceModel) => {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.ownerRef = model.ownerRef;
    this.setActiveCluster(model.activeClusterId);
  });

  toJSON(): WorkspaceModel {
    return toJS({
      id: this.id,
      name: this.name,
      description: this.description,
      ownerRef: this.ownerRef,
      activeClusterId: this.activeClusterId,
    });
  }
}

export class WorkspaceStore extends BaseStore<WorkspaceStoreModel> {
  static readonly defaultId: WorkspaceId = "default";
  private static stateRequestChannel = "workspace:states";

  @observable currentWorkspaceId = WorkspaceStore.defaultId;

  @observable workspaces = observable.map<WorkspaceId, Workspace>();

  private constructor() {
    super({
      configName: "lens-workspace-store",
      migrations
    });

    this.workspaces.set(WorkspaceStore.defaultId, new Workspace({
      id: WorkspaceStore.defaultId,
      name: "default",
    }));
  }

  async load() {
    await super.load();
    type workspaceStateSync = {
      id: string;
      state: WorkspaceState;
    };

    if (ipcRenderer) {
      logger.info("[WORKSPACE-STORE] requesting initial state sync");
      const workspaceStates: workspaceStateSync[] = await requestMain(WorkspaceStore.stateRequestChannel);

      workspaceStates.forEach((workspaceState) => {
        const workspace = this.getById(workspaceState.id);

        if (workspace) {
          workspace.setState(workspaceState.state);
        }
      });
    } else {
      handleRequest(WorkspaceStore.stateRequestChannel, (): workspaceStateSync[] => {
        const states: workspaceStateSync[] = [];

        this.workspacesList.forEach((workspace) => {
          states.push({
            state: workspace.getState(),
            id: workspace.id
          });
        });

        return states;
      });
    }
  }

  registerIpcListener() {
    logger.info("[WORKSPACE-STORE] starting to listen state events");
    ipcRenderer.on("workspace:state", (event, workspaceId: string, state: WorkspaceState) => {
      this.getById(workspaceId)?.setState(state);
    });
  }

  unregisterIpcListener() {
    super.unregisterIpcListener();
    ipcRenderer.removeAllListeners("workspace:state");
  }

  @computed get currentWorkspace(): Workspace {
    return this.getById(this.currentWorkspaceId);
  }

  @computed get workspacesList() {
    return Array.from(this.workspaces.values());
  }

  @computed get enabledWorkspacesList() {
    return this.workspacesList.filter((w) => w.enabled);
  }

  pushState() {
    this.workspaces.forEach((w) => {
      w.pushState();
    });
  }

  isDefault(id: WorkspaceId) {
    return id === WorkspaceStore.defaultId;
  }

  /**
   * Checks if `workspaceOrId` represents `WorkspaceStore.currentWorkspaceId`
   * @param workspaceOrId The workspace or its ID
   * @returns true if the given workspace is the currently active on
   */
  isActive(workspaceOrId: Workspace | WorkspaceId): boolean {
    const workspaceId = typeof workspaceOrId === "string"
      ? workspaceOrId
      : workspaceOrId.id;

    return this.currentWorkspaceId === workspaceId;
  }

  getById(id: WorkspaceId): Workspace {
    return this.workspaces.get(id);
  }

  getByName(name: string): Workspace {
    return this.workspacesList.find(workspace => workspace.name === name);
  }

  @action
  setActive(id = WorkspaceStore.defaultId) {
    if (id === this.currentWorkspaceId) return;

    if (!this.getById(id)) {
      throw new Error(`workspace ${id} doesn't exist`);
    }

    this.currentWorkspaceId = id;
  }

  @action
  async setActiveCluster(clusterOrId: ClusterId | Cluster): Promise<void> {
    const cluster = typeof clusterOrId === "string"
      ? clusterStore.getById(clusterOrId)
      : clusterOrId;

    if (!cluster?.enabled) {
      throw new Error(`cluster ${(clusterOrId as Cluster)?.id ?? clusterOrId} doesn't exist`);
    }

    this.setActive(this.getById(cluster.workspace).id);

    if (ipcRenderer) {
      const { navigate } = await import("../renderer/navigation");

      navigate(clusterViewURL({ params: { clusterId: cluster.id } }));
    } else {
      const { WindowManager } = await import("../main/window-manager");
      const windowManager = WindowManager.getInstance() as any;

      await windowManager.navigate(clusterViewURL({ params: { clusterId: cluster.id } }));
    }
  }

  @action
  addWorkspace(workspace: Workspace) {
    const { id, name } = workspace;

    if (!name.trim() || this.getByName(name.trim())) {
      return;
    }
    this.workspaces.set(id, workspace);

    if (!workspace.isManaged) {
      workspace.enabled = true;
    }

    appEventBus.emit({name: "workspace", action: "add"});

    return workspace;
  }

  @action
  updateWorkspace(workspace: Workspace) {
    this.workspaces.set(workspace.id, workspace);
    appEventBus.emit({name: "workspace", action: "update"});
  }

  @action
  removeWorkspace(workspace: Workspace) {
    this.removeWorkspaceById(workspace.id);
  }

  @action
  removeWorkspaceById(id: WorkspaceId) {
    const workspace = this.getById(id);

    if (!workspace) return;

    if (this.isDefault(id)) {
      throw new Error("Cannot remove default workspace");
    }

    if (this.currentWorkspaceId === id) {
      this.currentWorkspaceId = WorkspaceStore.defaultId; // reset to default
    }

    this.workspaces.delete(id);

    appEventBus.emit({name: "workspace", action: "remove"});
    clusterStore.removeByWorkspaceId(id);
  }

  @action
  /**
   * Attempts to clear `cluster` as the `activeCluster` from its own workspace
   * @returns true if the cluster was previously the active one for its workspace
   */
  tryClearAsActiveCluster(cluster: Cluster): boolean {
    return this.getById(cluster.workspace).tryClearAsActiveCluster(cluster);
  }

  @action
  protected fromStore({ currentWorkspace, workspaces = [] }: WorkspaceStoreModel) {
    if (currentWorkspace) {
      this.currentWorkspaceId = currentWorkspace;
    }

    const currentWorkspaces = this.workspaces.toJS();
    const newWorkspaceIds = new Set<WorkspaceId>([WorkspaceStore.defaultId]); // never delete default

    for (const workspaceModel of workspaces) {
      const oldWorkspace = this.workspaces.get(workspaceModel.id);

      if (oldWorkspace) {
        oldWorkspace[updateFromModel](workspaceModel);
      } else {
        this.workspaces.set(workspaceModel.id, new Workspace(workspaceModel));
      }

      newWorkspaceIds.add(workspaceModel.id);
    }

    // remove deleted workspaces
    for (const workspaceId of currentWorkspaces.keys()) {
      if (!newWorkspaceIds.has(workspaceId)) {
        this.workspaces.delete(workspaceId);
      }
    }
  }

  toJSON(): WorkspaceStoreModel {
    return toJS({
      currentWorkspace: this.currentWorkspaceId,
      workspaces: this.workspacesList.map((w) => w.toJSON()),
    }, {
      recurseEverything: true
    });
  }
}

export const workspaceStore = WorkspaceStore.getInstance<WorkspaceStore>();
