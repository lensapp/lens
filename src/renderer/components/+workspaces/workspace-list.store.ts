import { Workspace, WorkspaceId, workspaceStore } from "../../../common/workspace-store";
import { ItemStore } from "../../item.store";

export class WorkspaceItem {
    workspace: Workspace;

    getName() {
        return this.workspace.name;
    }

    getId() {
        return this.workspace.id;
    }
}

export class WorkspaceListStore extends ItemStore<WorkspaceItem> {

    loadAll() {
        return this.loadItems(() => workspaceStore.workspacesList.map(workspace => {
            let ws = new WorkspaceItem();
            ws.workspace = workspace;
            return ws;
        }));
      }
}

export const workspaceListStore = new WorkspaceListStore();
