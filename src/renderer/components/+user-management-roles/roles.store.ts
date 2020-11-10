import { clusterRoleApi, Role, roleApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class RolesStore extends KubeObjectStore<Role> {
  api = clusterRoleApi

  subscribe() {
    return super.subscribe([roleApi, clusterRoleApi])
  }

  protected sortItems(items: Role[]) {
    return super.sortItems(items, [
      role => role.kind,
      role => role.getName(),
    ])
  }

  protected loadItem(params: { name: string; namespace?: string }) {
    if (params.namespace) return roleApi.get(params)
    return clusterRoleApi.get(params)
  }

  protected loadItems(namespaces?: string[]): Promise<Role[]> {
    if (namespaces) {
      return Promise.all(
        namespaces.map(namespace => roleApi.list({ namespace }))
      ).then(items => items.flat())
    } else {
      return Promise.all([clusterRoleApi.list(), roleApi.list()])
        .then(items => items.flat())
    }
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<Role>) {
    if (params.namespace) {
      return roleApi.create(params, data)
    } else {
      return clusterRoleApi.create(params, data)
    }
  }
}

export const rolesStore = new RolesStore();

apiManager.registerStore(rolesStore, [
  roleApi,
  clusterRoleApi,
]);