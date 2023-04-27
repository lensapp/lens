/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RoleBinding, RoleBindingData, Subject } from "@k8slens/kube-object";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { HashSet } from "@k8slens/utilities";
import { hashSubject } from "../hashers";
import type { RoleBindingApi } from "../../../../common/k8s-api/endpoints";

export class RoleBindingStore extends KubeObjectStore<RoleBinding, RoleBindingApi, RoleBindingData> {
  protected sortItems(items: RoleBinding[]) {
    return super.sortItems(items, [
      roleBinding => roleBinding.kind,
      roleBinding => roleBinding.getName(),
    ]);
  }

  async updateSubjects(roleBinding: RoleBinding, subjects: Subject[]) {
    return this.update(roleBinding, {
      roleRef: roleBinding.roleRef,
      subjects,
    });
  }

  async removeSubjects(roleBinding: RoleBinding, subjectsToRemove: Iterable<Subject>) {
    const currentSubjects = new HashSet(roleBinding.getSubjects(), hashSubject);

    for (const subject of subjectsToRemove) {
      currentSubjects.delete(subject);
    }

    return this.updateSubjects(roleBinding, currentSubjects.toJSON());
  }
}
