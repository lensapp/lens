import difference from "lodash/difference";
import uniqBy from "lodash/uniqBy";
import { clusterRoleBindingApi, IRoleBindingSubject, RoleBinding, roleBindingApi } from "../../api/endpoints";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { autobind } from "../../utils";
import { apiManager } from "../../api/api-manager";

@autobind()
export class RoleBindingsStore extends KubeObjectStore<RoleBinding> {
  api = clusterRoleBindingApi;

  getSubscribeApis() {
    return [clusterRoleBindingApi, roleBindingApi];
  }

  protected sortItems(items: RoleBinding[]) {
    return super.sortItems(items, [
      roleBinding => roleBinding.kind,
      roleBinding => roleBinding.getName()
    ]);
  }

  protected loadItem(params: { name: string; namespace?: string }) {
    if (params.namespace) return roleBindingApi.get(params);

    return clusterRoleBindingApi.get(params);
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams): Promise<RoleBinding[]> {
    const items = await Promise.all([
      super.loadItems({ ...params, api: clusterRoleBindingApi }),
      super.loadItems({ ...params, api: roleBindingApi }),
    ]);

    return items.flat();
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<RoleBinding>) {
    if (params.namespace) {
      return roleBindingApi.create(params, data);
    } else {
      return clusterRoleBindingApi.create(params, data);
    }
  }

  async updateSubjects(params: {
    roleBinding: RoleBinding;
    addSubjects?: IRoleBindingSubject[];
    removeSubjects?: IRoleBindingSubject[];
  }) {
    const { roleBinding, addSubjects, removeSubjects } = params;
    const currentSubjects = roleBinding.getSubjects();
    let newSubjects = currentSubjects;

    if (addSubjects) {
      newSubjects = uniqBy(currentSubjects.concat(addSubjects), ({ kind, name, namespace }) => {
        return [kind, name, namespace].join("-");
      });
    } else if (removeSubjects) {
      newSubjects = difference(currentSubjects, removeSubjects);
    }

    return this.update(roleBinding, {
      roleRef: roleBinding.roleRef,
      subjects: newSubjects
    });
  }
}

export const roleBindingsStore = new RoleBindingsStore();

apiManager.registerStore(roleBindingsStore, [
  roleBindingApi,
  clusterRoleBindingApi,
]);
