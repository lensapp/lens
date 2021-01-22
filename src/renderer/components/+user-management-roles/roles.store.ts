import { clusterRoleApi, Role, roleApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class RolesStore extends KubeObjectStore<Role> {
  api = clusterRoleApi;

  getSubscribeApis() {
    return [roleApi, clusterRoleApi];
  }

  protected sortItems(items: Role[]) {
    return super.sortItems(items, [
      role => role.kind,
      role => role.getName(),
    ]);
  }

  protected loadItem(params: { name: string; namespace?: string }) {
    if (params.namespace) return roleApi.get(params);

    return clusterRoleApi.get(params);
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams): Promise<Role[]> {
    const items = await Promise.all([
      super.loadItems({ ...params, api: clusterRoleApi }),
      super.loadItems({ ...params, api: roleApi }),
    ]);

    return items.flat();
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<Role>) {
    if (params.namespace) {
      return roleApi.create(params, data);
    } else {
      return clusterRoleApi.create(params, data);
    }
  }
}

export const rolesStore = new RolesStore();

apiManager.registerStore(rolesStore, [
  roleApi,
  clusterRoleApi,
]);
