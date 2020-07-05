import Config from "conf"
import Singleton from "./utils/singleton";
import { clusterStore } from "./cluster-store"
import { getAppVersion } from "./utils/app-version";

export type WorkspaceId = string;

export interface WorkspaceStoreModel {
  workspaces: Workspace[]
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  description?: string;
}

export class WorkspaceStore extends Singleton {
  static readonly defaultId = "default"

  private storeConfig = new Config<WorkspaceStoreModel>({
    configName: "lens-workspace-store",
    projectVersion: getAppVersion(),
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
    return this.storeConfig.get("workspaces", [])
  }

  public saveWorkspace(workspace: Workspace) {
    const workspaces = this.getAllWorkspaces()
    const index = workspaces.findIndex((w) => w.id === workspace.id)
    if (index !== -1) {
      workspaces[index] = workspace
    } else {
      workspaces.push(workspace)
    }
    this.storeConfig.set("workspaces", workspaces)
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
      this.storeConfig.set("workspaces", workspaces)
    }
  }
}

export const workspaceStore: WorkspaceStore = WorkspaceStore.getInstance()
