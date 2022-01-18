/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiManager } from "../../../../common/k8s-api/api-manager";
import { RoleBinding, roleBindingApi, RoleBindingSubject } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { HashSet } from "../../../utils";
import { hashRoleBindingSubject } from "./hashers";

export class RoleBindingsStore extends KubeObjectStore<RoleBinding> {
  api = roleBindingApi;

  protected sortItems(items: RoleBinding[]) {
    return super.sortItems(items, [
      roleBinding => roleBinding.kind,
      roleBinding => roleBinding.getName(),
    ]);
  }

  protected async createItem(params: { name: string; namespace: string }, data?: Partial<RoleBinding>) {
    return roleBindingApi.create(params, data);
  }

  async updateSubjects(roleBinding: RoleBinding, subjects: RoleBindingSubject[]) {
    return this.update(roleBinding, {
      roleRef: roleBinding.roleRef,
      subjects,
    });
  }

  async removeSubjects(roleBinding: RoleBinding, subjectsToRemove: Iterable<RoleBindingSubject>) {
    const currentSubjects = new HashSet(roleBinding.getSubjects(), hashRoleBindingSubject);

    for (const subject of subjectsToRemove) {
      currentSubjects.delete(subject);
    }

    return this.updateSubjects(roleBinding, currentSubjects.toJSON());
  }
}

export const roleBindingsStore = new RoleBindingsStore();

apiManager.registerStore(roleBindingsStore);
