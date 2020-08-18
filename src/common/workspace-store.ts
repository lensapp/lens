import { action, computed, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import { clusterStore } from "./cluster-store"

export type WorkspaceId = string;

export interface WorkspaceStoreModel {
  currentWorkspace?: WorkspaceId;
  workspaces: Workspace[]
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  description?: string;
}

export class WorkspaceStore extends BaseStore<WorkspaceStoreModel> {
  static readonly defaultId: WorkspaceId = "default"

  private constructor() {
    super({
      configName: "lens-workspace-store",
    });
  }

  @observable currentWorkspaceId = WorkspaceStore.defaultId;

  @observable workspaces = observable.map<WorkspaceId, Workspace>({
    [WorkspaceStore.defaultId]: {
      id: WorkspaceStore.defaultId,
      name: "default"
    }
  });

  @computed get currentWorkspace(): Workspace {
    return this.getById(this.currentWorkspaceId);
  }

  @computed get workspacesList() {
    return Array.from(this.workspaces.values());
  }

  isDefault(id: WorkspaceId) {
    return id === WorkspaceStore.defaultId;
  }

  getById(id: WorkspaceId): Workspace {
    return this.workspaces.get(id);
  }

  @action
  setActive(id = WorkspaceStore.defaultId) {
    if (!this.getById(id)) {
      throw new Error(`workspace ${id} doesn't exist`);
    }

    this.currentWorkspaceId = id;
  }

  @action
  saveWorkspace(workspace: Workspace) {
    const id = workspace.id;
    const existingWorkspace = this.getById(id);
    if (existingWorkspace) {
      Object.assign(existingWorkspace, workspace);
    } else {
      this.workspaces.set(id, workspace);
    }
  }

  @action
  removeWorkspace(id: WorkspaceId) {
    const workspace = this.getById(id);
    if (!workspace) return;
    if (this.isDefault(id)) {
      throw new Error("Cannot remove default workspace");
    }
    if (this.currentWorkspaceId === id) {
      this.currentWorkspaceId = WorkspaceStore.defaultId; // reset to default
    }
    this.workspaces.delete(id);
    clusterStore.removeByWorkspaceId(id)
  }

  @action
  protected fromStore({ currentWorkspace, workspaces = [] }: WorkspaceStoreModel) {
    if (currentWorkspace) {
      this.currentWorkspaceId = currentWorkspace
    }
    if (workspaces.length) {
      this.workspaces.clear();
      workspaces.forEach(workspace => {
        this.workspaces.set(workspace.id, workspace)
      })
    }
  }

  toJSON(): WorkspaceStoreModel {
    return toJS({
      currentWorkspace: this.currentWorkspaceId,
      workspaces: this.workspacesList,
    }, {
      recurseEverything: true
    })
  }
}

export const workspaceStore = WorkspaceStore.getInstance<WorkspaceStore>()
