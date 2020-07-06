import { computed, toJS } from "mobx";
import { BaseStore } from "./base-store";
import { clusterStore } from "./cluster-store"

export type WorkspaceId = string;

export interface WorkspaceStoreModel {
  workspaces: Workspace[]
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  description?: string;
}

export class WorkspaceStore extends BaseStore<WorkspaceStoreModel> {
  static readonly defaultId: WorkspaceId = "default"

  protected data: WorkspaceStoreModel = {
    workspaces: [{
      id: WorkspaceStore.defaultId,
      name: "default"
    }]
  }

  @computed get workspaces() {
    return toJS(this.data.workspaces);
  }

  private constructor() {
    super({
      configName: "lens-workspace-store",
    });
  }

  public getById(id: WorkspaceId): Workspace {
    return this.workspaces.find(workspace => workspace.id === id);
  }

  public getIndexById(id: WorkspaceId): number {
    return this.workspaces.findIndex(workspace => workspace.id === id);
  }

  public saveWorkspace(newWorkspace: Workspace) {
    const workspace = this.getById(newWorkspace.id);
    if (workspace) {
      Object.assign(workspace, newWorkspace);
    } else {
      this.data.workspaces.push(newWorkspace);
    }
  }

  public removeWorkspace(workspaceOrId: Workspace | WorkspaceId) {
    const workspace = this.getById(typeof workspaceOrId == "string" ? workspaceOrId : workspaceOrId.id);
    if (!workspace) return;
    if (workspace.id === WorkspaceStore.defaultId) {
      throw new Error("Cannot remove default workspace");
    }
    const index = this.getIndexById(workspace.id);
    if (index > -1) {
      this.data.workspaces.splice(index, 1)
      clusterStore.removeClustersByWorkspace(workspace.id)
    }
  }
}

export const workspaceStore: WorkspaceStore = WorkspaceStore.getInstance()
