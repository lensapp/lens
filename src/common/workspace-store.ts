import { action, computed, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import { clusterStore } from "./cluster-store"
import { landingURL } from "../renderer/components/+landing-page/landing-page.route";
import { navigate } from "../renderer/navigation";
import { appEventBus } from "./event-bus";

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

  getByName(name: string): Workspace {
    return this.workspacesList.find(workspace => workspace.name === name);
  }

  @action
  setActive(id = WorkspaceStore.defaultId, { redirectToLanding = true, resetActiveCluster = true } = {}) {
    if (id === this.currentWorkspaceId) return;
    if (!this.getById(id)) {
      throw new Error(`workspace ${id} doesn't exist`);
    }
    this.currentWorkspaceId = id;
    if (resetActiveCluster) {
      clusterStore.setActive(null)
    }
    if (redirectToLanding) {
      navigate(landingURL())
    }
  }

  @action
  saveWorkspace(workspace: Workspace) {
    const { id, name } = workspace;
    const existingWorkspace = this.getById(id);
    if (!name.trim() || this.getByName(name.trim())) {
      return;
    }
    if (existingWorkspace) {
      Object.assign(existingWorkspace, workspace);
      appEventBus.emit({name: "workspace", action: "update"})
    } else {
      appEventBus.emit({name: "workspace", action: "add"})
    }
    this.workspaces.set(id, workspace);
    return workspace;
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
    appEventBus.emit({name: "workspace", action: "remove"})
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
