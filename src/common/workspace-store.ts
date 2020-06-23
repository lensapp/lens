import * as ElectronStore from "electron-store"
import { ClusterStore } from "./cluster-store"

export interface WorkspaceData {
  id: string;
  name: string;
  description?: string;
}

interface WorkspaceStoreData {
  workspaces: WorkspaceData[];
  lastSeenId: string;
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
    
    const wks = this.store.get("workspaces", []);
    if (!this.store.get("lastSeenId")) {
      this.store.set("lastSeenId", wks[0].id);
    }
  }

  public setLastSeenId(id: string) {
    this.store.set("lastSeenId", id);
  }

  public getLastSeenId(): string {
    return this.store.get("lastSeenId");
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
    const workspaces = this.getAllWorkspaces()

    if (workspaces.length < 1) {
      throw new Error("Cannot remove last workspace");
    }

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

  public getCurrentWorkspace(): Workspace | null {
    return this.getWorkspace(this.getLastSeenId());
  }

  public getAllWorkspaces(): Array<Workspace> {
    return this.store.get("workspaces", []).map((wsd) => new Workspace(wsd))
  }

  static getInstance(): WorkspaceStore {
    if (!WorkspaceStore.instance) {
      WorkspaceStore.instance = new WorkspaceStore()
    }
    return WorkspaceStore.instance
  }
}
