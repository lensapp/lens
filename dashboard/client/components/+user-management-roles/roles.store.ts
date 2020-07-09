import { clusterRoleApi, Role, roleApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class RolesStore extends KubeObjectStore<Role> {
  api = clusterRoleApi

  subscribe(): () => void {
    return super.subscribe([roleApi, clusterRoleApi]);
  }

  protected sortItems(items: Role[]): Role[] {
    return super.sortItems(items, [
      (role): string => role.kind,
      (role): string => role.getName(),
    ]);
  }

  protected loadItem(params: { name: string; namespace?: string }): Promise<Role> {
    if (params.namespace) {
      return roleApi.get(params);
    }
    
    return clusterRoleApi.get(params);
  }

  protected async loadItems(namespaces?: string[]): Promise<Role[]> {
    if (namespaces) {
      return (
        await Promise.all(namespaces.map(namespace => roleApi.list({ namespace })))
      ).flat();
    }

    return (
      await Promise.all([clusterRoleApi.list(), roleApi.list()])
    ).flat();
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<Role>): Promise<Role> {
    if (params.namespace) {
      return roleApi.create(params, data);
    }

    return clusterRoleApi.create(params, data);
  }
}

export const rolesStore = new RolesStore();

apiManager.registerStore(roleApi, rolesStore);
apiManager.registerStore(clusterRoleApi, rolesStore);
