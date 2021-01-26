import { ipcRenderer } from "electron";
import { action, computed, observable, toJS, reaction } from "mobx";
import { BaseStore } from "./base-store";
import { clusterStore } from "./cluster-store";
import { appEventBus } from "./event-bus";
import { broadcastMessage, handleRequest, requestMain } from "../common/ipc";
import logger from "../main/logger";
import type { ClusterId } from "./cluster-store";

export type WorkspaceId = string;

export interface WorkspaceStoreModel {
  workspaces: WorkspaceModel[];
  currentWorkspace?: WorkspaceId;
}

export interface WorkspaceModel {
  id: WorkspaceId;
  name: string;
  description?: string;
  ownerRef?: string;
  lastActiveClusterId?: ClusterId;
}

export interface WorkspaceState {
  enabled: boolean;
}

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

  /**
   * Last active cluster id
   *
   * @observable
   */
  @observable lastActiveClusterId?: ClusterId;


  @observable private _enabled: boolean;

  constructor(data: WorkspaceModel) {
    Object.assign(this, data);

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
   * @observable
   */
  get enabled(): boolean {
    return !this.isManaged || this._enabled;
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled;
  }

  /**
   * Is workspace managed by an extension
   */
  get isManaged(): boolean {
    return !!this.ownerRef;
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
   * @interal
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
    Object.assign(this, state);
  }

  toJSON(): WorkspaceModel {
    return toJS({
      id: this.id,
      name: this.name,
      description: this.description,
      ownerRef: this.ownerRef,
      lastActiveClusterId: this.lastActiveClusterId
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
    });

    this.workspaces.set(WorkspaceStore.defaultId, new Workspace({
      id: WorkspaceStore.defaultId,
      name: "default"
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
  setLastActiveClusterId(clusterId?: ClusterId, workspaceId = this.currentWorkspaceId) {
    this.getById(workspaceId).lastActiveClusterId = clusterId;
  }

  @action
  protected fromStore({ currentWorkspace, workspaces = [] }: WorkspaceStoreModel) {
    if (currentWorkspace) {
      this.currentWorkspaceId = currentWorkspace;
    }

    if (workspaces.length) {
      this.workspaces.clear();
      workspaces.forEach(ws => {
        const workspace = new Workspace(ws);

        if (!workspace.isManaged) {
          workspace.enabled = true;
        }
        this.workspaces.set(workspace.id, workspace);
      });
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
