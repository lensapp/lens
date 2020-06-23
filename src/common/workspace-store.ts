import ElectronStore from "electron-store"
import { ClusterStore } from "./cluster-store"

export interface WorkspaceData {
  id: string;
  name: string;
  description?: string;
}

interface WorkspaceStoreData {
  workspaces: WorkspaceData[];
}

export class Workspace implements WorkspaceData {
  public id: string
  public name: string
  public description?: string

  public constructor(data: WorkspaceData) {
    Object.assign(this, data)
  }
}

export class WorkspaceStore {
  public static defaultId = "default"
  private static instance: WorkspaceStore;
  private store: ElectronStore<WorkspaceStoreData>;

  private constructor() {
    this.store = new ElectronStore({
      name: "lens-workspace-store",
    })

    if (this.store.get("workspaces", []).length === 0) {
      this.store.set("workspaces", [{
        id: "default",
        name: "default"
      }]);
    }
  }
    
  public storeWorkspace(workspace: WorkspaceData) {
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
      ClusterStore.getInstance().removeClustersByWorkspace(workspace.id)
      workspaces.splice(index, 1)
      this.store.set("workspaces", workspaces)
    }
  }

  public getWorkspace(id: string): Workspace | null {
    return this.store.get("workspaces", []).find(wsd => wsd.id == id) || null;
  }

  public getAllWorkspaces(): Array<Workspace> {
    const workspacesData: WorkspaceData[]  = this.store.get("workspaces", [])

    return workspacesData.map((wsd) => new Workspace(wsd))
  }

  static getInstance(): WorkspaceStore {
    if (!WorkspaceStore.instance) {
      WorkspaceStore.instance = new WorkspaceStore()
    }
    return WorkspaceStore.instance
  }
}

const workspaceStore: WorkspaceStore = WorkspaceStore.getInstance()

if (!workspaceStore.getAllWorkspaces().find( ws => ws.id === WorkspaceStore.defaultId)) {
  workspaceStore.storeWorkspace({
    id: WorkspaceStore.defaultId,
    name: "default"
  })
}

export { workspaceStore }
