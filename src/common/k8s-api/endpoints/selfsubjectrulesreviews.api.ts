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

import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class SelfSubjectRulesReviewApi extends KubeApi<SelfSubjectRulesReview> {
  create({ namespace = "default" }): Promise<SelfSubjectRulesReview> {
    return super.create({}, {
      spec: {
        namespace,
      },
    });
  }
}

export interface ISelfSubjectReviewRule {
  verbs: string[];
  apiGroups?: string[];
  resources?: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
}

export interface SelfSubjectRulesReview {
  spec: {
    namespace?: string;
  };
  status: {
    resourceRules: ISelfSubjectReviewRule[];
    nonResourceRules: ISelfSubjectReviewRule[];
    incomplete: boolean;
  };
}

export class SelfSubjectRulesReview extends KubeObject {
  static kind = "SelfSubjectRulesReview";
  static namespaced = false;
  static apiBase = "/apis/authorization.k8s.io/v1/selfsubjectrulesreviews";

  getResourceRules() {
    const rules = this.status && this.status.resourceRules || [];

    return rules.map(rule => this.normalize(rule));
  }

  getNonResourceRules() {
    const rules = this.status && this.status.nonResourceRules || [];

    return rules.map(rule => this.normalize(rule));
  }

  protected normalize(rule: ISelfSubjectReviewRule): ISelfSubjectReviewRule {
    const { apiGroups = [], resourceNames = [], verbs = [], nonResourceURLs = [], resources = [] } = rule;

    return {
      apiGroups,
      nonResourceURLs,
      resourceNames,
      verbs,
      resources: resources.map((resource, index) => {
        const apiGroup = apiGroups.length >= index + 1 ? apiGroups[index] : apiGroups.slice(-1)[0];
        const separator = apiGroup == "" ? "" : ".";

        return resource + separator + apiGroup;
      }),
    };
  }
}

let selfSubjectRulesReviewApi: SelfSubjectRulesReviewApi;

if (isClusterPageContext()) {
  selfSubjectRulesReviewApi = new SelfSubjectRulesReviewApi({
    objectConstructor: SelfSubjectRulesReview,
  });
}

export {
  selfSubjectRulesReviewApi,
};

