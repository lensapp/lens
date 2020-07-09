import difference from "lodash/difference";
import uniqBy from "lodash/uniqBy";
import { clusterRoleBindingApi, RoleBindingSubject, RoleBinding, roleBindingApi } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { apiManager } from "../../api/api-manager";

@autobind()
export class RoleBindingsStore extends KubeObjectStore<RoleBinding> {
  api = clusterRoleBindingApi

  subscribe(): () => void {
    return super.subscribe([clusterRoleBindingApi, roleBindingApi]);
  }

  protected sortItems(items: RoleBinding[]): RoleBinding[] {
    return super.sortItems(items, [
      (roleBinding): string => roleBinding.kind,
      (roleBinding): string => roleBinding.getName()
    ]);
  }

  protected loadItem(params: { name: string; namespace?: string }): Promise<RoleBinding> {
    if (params.namespace) {
      return roleBindingApi.get(params);
    }

    return clusterRoleBindingApi.get(params);
  }

  protected async loadItems(namespaces?: string[]): Promise<RoleBinding[]> {
    if (namespaces) {
      return (
        await Promise.all(namespaces.map(namespace => roleBindingApi.list({ namespace })))
      ).flat();
    }
    
    return (
      await Promise.all([clusterRoleBindingApi.list(), roleBindingApi.list()])
    ).flat();
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<RoleBinding>): Promise<RoleBinding> {
    if (params.namespace) {
      return roleBindingApi.create(params, data);
    }

    return clusterRoleBindingApi.create(params, data);
  }

  async updateSubjects(params: {
    roleBinding: RoleBinding;
    addSubjects?: RoleBindingSubject[];
    removeSubjects?: RoleBindingSubject[];
  }): Promise<RoleBinding> {
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

apiManager.registerStore(roleBindingApi, roleBindingsStore);
apiManager.registerStore(clusterRoleBindingApi, roleBindingsStore);
