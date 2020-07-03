import ElectronStore from "electron-store"
import { Singleton } from "./utils/singleton";
import { clusterStore } from "./cluster-store"

export type WorkspaceId = string;

export interface WorkspaceData {
  id: WorkspaceId;
  name: string;
  description?: string;
}

export class Workspace implements WorkspaceData {
  public id: string
  public name: string
  public description?: string

  public constructor(data: WorkspaceData) {
    Object.assign(this, data)
  }
}

export class WorkspaceStore extends Singleton {
  static defaultId = "default"

  private store = new ElectronStore({
    name: "lens-workspace-store"
  });

  private constructor() {
    super();
    this.init();
  }

  protected init() {
    if (!this.getWorkspace(WorkspaceStore.defaultId)) {
      this.saveWorkspace({
        id: WorkspaceStore.defaultId,
        name: "default"
      })
    }
  }

  public getWorkspace(id: WorkspaceId): Workspace {
    return this.getAllWorkspaces().find(workspace => workspace.id === id)
  }

  public getAllWorkspaces(): Workspace[] {
    const workspacesData: WorkspaceData[] = this.store.get("workspaces", [])
    return workspacesData.map((wsd) => new Workspace(wsd))
  }

  public saveWorkspace(workspace: WorkspaceData) {
    const workspaces = this.getAllWorkspaces()
    const index = workspaces.findIndex((w) => w.id === workspace.id)
    if (index !== -1) {
      workspaces[index] = workspace
    } else {
      workspaces.push(workspace)
    }
    this.store.set("workspaces", workspaces)
  }

  public removeWorkspace(workspace: Workspace) {
    if (workspace.id === WorkspaceStore.defaultId) {
      throw new Error("Cannot remove default workspace")
    }
    const workspaces = this.getAllWorkspaces()
    const index = workspaces.findIndex((w) => w.id === workspace.id)
    if (index !== -1) {
      clusterStore.removeClustersByWorkspace(workspace.id)
      workspaces.splice(index, 1)
      this.store.set("workspaces", workspaces)
    }
  }
}

export const workspaceStore: WorkspaceStore = WorkspaceStore.getInstance()
