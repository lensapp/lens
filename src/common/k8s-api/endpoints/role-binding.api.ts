/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export type RoleBindingSubjectKind = "Group" | "ServiceAccount" | "User";

export interface RoleBindingSubject {
  kind: RoleBindingSubjectKind;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export interface RoleBinding {
  subjects?: RoleBindingSubject[];
  roleRef: {
    kind: string;
    name: string;
    apiGroup?: string;
  };
}

export class RoleBinding extends KubeObject {
  static kind = "RoleBinding";
  static namespaced = true;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/rolebindings";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

/**
 * The api type for {@link RoleBinding}'s
 */

export class RoleBindingApi extends KubeApi<RoleBinding> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: RoleBinding,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const roleBindingApi = isClusterPageContext()
  ? new RoleBindingApi()
  : undefined;
