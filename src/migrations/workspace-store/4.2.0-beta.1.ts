import { migration } from "../migration-wrapper";

interface Pre420Beta1WorkspaceModel {
  id: string;
  name: string;
  description?: string;
  ownerRef?: string;
  lastActiveClusterId?: string;
}

export default migration({
  version: "4.2.0-beta.1",
  run(store) {
    const oldWorkspaces: Pre420Beta1WorkspaceModel[] = store.get("workspaces") ?? [];
    const workspaces = oldWorkspaces.map(({ lastActiveClusterId, ...rest }) => {
      if (lastActiveClusterId) {
        return {
          activeClusterId: lastActiveClusterId,
          ...rest,
        };
      }

      return rest;
    });

    store.set("workspaces", workspaces);
  }
});
