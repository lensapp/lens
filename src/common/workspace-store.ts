import { action, observable } from "mobx";
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

  @observable currentWorkspace = WorkspaceStore.defaultId;

  @observable workspaces = observable.map<WorkspaceId, Workspace>({
    [WorkspaceStore.defaultId]: {
      id: WorkspaceStore.defaultId,
      name: "default"
    }
  });

  private constructor() {
    super({
      configName: "lens-workspace-store",
    });
  }

  getById(id: WorkspaceId): Workspace {
    return this.workspaces.get(id);
  }

  @action
  setCurrent(id: WorkspaceId) {
    if (!this.getById(id)) return;
    this.currentWorkspace = id;
  }

  @action
  public saveWorkspace(workspace: Workspace) {
    const id = workspace.id;
    const existingWorkspace = this.getById(id);
    if (existingWorkspace) {
      Object.assign(existingWorkspace, workspace);
    } else {
      this.workspaces.set(id, workspace);
    }
  }

  @action
  public removeWorkspace(id: WorkspaceId) {
    const workspace = this.getById(id);
    if (!workspace) return;
    if (id === WorkspaceStore.defaultId) {
      throw new Error("Cannot remove default workspace");
    }
    if (id === this.currentWorkspace) {
      this.currentWorkspace = WorkspaceStore.defaultId;
    }
    this.workspaces.delete(id);
    clusterStore.removeByWorkspaceId(id)
  }

  @action
  protected fromStore({ currentWorkspace, workspaces = [] }: WorkspaceStoreModel) {
    if (currentWorkspace) {
      this.currentWorkspace = currentWorkspace
    }
    if (workspaces.length) {
      this.workspaces.clear();
      workspaces.forEach(workspace => {
        this.workspaces.set(workspace.id, workspace)
      })
    }
  }

  toJSON(): WorkspaceStoreModel {
    const { currentWorkspace, workspaces } = this;
    return {
      currentWorkspace: currentWorkspace,
      workspaces: Array.from(workspaces.values()),
    }
  }
}

export const workspaceStore: WorkspaceStore = WorkspaceStore.getInstance()
