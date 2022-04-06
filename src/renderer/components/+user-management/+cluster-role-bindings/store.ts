/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { ClusterRoleBinding, ClusterRoleBindingSubject } from "../../../../common/k8s-api/endpoints";
import { clusterRoleBindingApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind, HashSet } from "../../../utils";
import { hashClusterRoleBindingSubject } from "./hashers";

export class ClusterRoleBindingsStore extends KubeObjectStore<ClusterRoleBinding> {
  api = clusterRoleBindingApi;

  constructor() {
    super();
    autoBind(this);
  }

  protected sortItems(items: ClusterRoleBinding[]) {
    return super.sortItems(items, [
      clusterRoleBinding => clusterRoleBinding.kind,
      clusterRoleBinding => clusterRoleBinding.getName(),
    ]);
  }

  async updateSubjects(clusterRoleBinding: ClusterRoleBinding, subjects: ClusterRoleBindingSubject[]) {
    return this.update(clusterRoleBinding, {
      roleRef: clusterRoleBinding.roleRef,
      subjects,
    });
  }

  async removeSubjects(clusterRoleBinding: ClusterRoleBinding, subjectsToRemove: Iterable<ClusterRoleBindingSubject>) {
    const currentSubjects = new HashSet(clusterRoleBinding.getSubjects(), hashClusterRoleBindingSubject);

    for (const subject of subjectsToRemove) {
      currentSubjects.delete(subject);
    }

    return this.updateSubjects(clusterRoleBinding, currentSubjects.toJSON());
  }
}

export const clusterRoleBindingsStore = new ClusterRoleBindingsStore();

apiManager.registerStore(clusterRoleBindingsStore);
