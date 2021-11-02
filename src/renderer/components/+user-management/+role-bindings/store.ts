/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
