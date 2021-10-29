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
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";

export type ClusterRoleBindingSubjectKind = "Group" | "ServiceAccount" | "User";

export interface ClusterRoleBindingSubject {
  kind: ClusterRoleBindingSubjectKind;
  name: string;
  apiGroup?: string;
  namespace?: string;
}

export interface ClusterRoleBinding {
  subjects?: ClusterRoleBindingSubject[];
  roleRef: {
    kind: string;
    name: string;
    apiGroup?: string;
  };
}

export class ClusterRoleBinding extends KubeObject {
  static kind = "ClusterRoleBinding";
  static namespaced = false;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings";

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

/**
 * Only available within kubernetes cluster pages
 */
let clusterRoleBindingApi: KubeApi<ClusterRoleBinding>;

if (isClusterPageContext()) {
  clusterRoleBindingApi = new KubeApi({
    objectConstructor: ClusterRoleBinding,
  });
}

export {
  clusterRoleBindingApi,
};
