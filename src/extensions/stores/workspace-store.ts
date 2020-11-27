import { Singleton } from "../core-api/utils";
import { workspaceStore as internalWorkspaceStore, WorkspaceStore as InternalWorkspaceStore, Workspace, WorkspaceId } from "../../common/workspace-store";
import { ObservableMap } from "mobx";

export { Workspace } from "../../common/workspace-store";
export type { WorkspaceId, WorkspaceModel } from "../../common/workspace-store";

/**
 * Stores all workspaces
 */
export class WorkspaceStore extends Singleton {
  /**
   * Default workspace id, this workspace is always present
   */
  static readonly defaultId: WorkspaceId = InternalWorkspaceStore.defaultId;

  /**
   * Currently active workspace id
   */
  get currentWorkspaceId(): string {
    return internalWorkspaceStore.currentWorkspaceId;
  }

  /**
   * Set active workspace id
   */
  set currentWorkspaceId(id: string) {
    internalWorkspaceStore.currentWorkspaceId = id;
  }

  /**
   * Map of all workspaces
   */
  get workspaces(): ObservableMap<string, Workspace> {
    return internalWorkspaceStore.workspaces;
  }

  /**
   * Currently active workspace
   */
  get currentWorkspace(): Workspace {
    return internalWorkspaceStore.currentWorkspace;
  }

  /**
   * Array of all workspaces
   */
  get workspacesList(): Workspace[] {
    return internalWorkspaceStore.workspacesList;
  }

  /**
   * Array of all enabled (visible) workspaces
   */
  get enabledWorkspacesList(): Workspace[] {
    return internalWorkspaceStore.enabledWorkspacesList;
  }

  /**
   * Get workspace by id
   * @param id workspace id
   */
  getById(id: WorkspaceId): Workspace {
    return internalWorkspaceStore.getById(id);
  }

  /**
   * Get workspace by name
   * @param name workspace name
   */
  getByName(name: string): Workspace {
    return internalWorkspaceStore.getByName(name);
  }

  /**
   * Set active workspace
   * @param id workspace id
   */
  setActive(id = WorkspaceStore.defaultId) {
    return internalWorkspaceStore.setActive(id);
  }

  /**
   * Add a workspace to store
   * @param workspace workspace
   */
  addWorkspace(workspace: Workspace) {
    return internalWorkspaceStore.addWorkspace(workspace);
  }

  /**
   * Update a workspace in store
   * @param workspace workspace
   */
  updateWorkspace(workspace: Workspace) {
    return internalWorkspaceStore.updateWorkspace(workspace);
  }

  /**
   * Remove workspace from store
   * @param workspace workspace
   */
  removeWorkspace(workspace: Workspace) {
    return internalWorkspaceStore.removeWorkspace(workspace);
  }

  /**
   * Remove workspace by id
   * @param id workspace
   */
  removeWorkspaceById(id: WorkspaceId) {
    return internalWorkspaceStore.removeWorkspaceById(id);
  }
}

export const workspaceStore = WorkspaceStore.getInstance<WorkspaceStore>();
