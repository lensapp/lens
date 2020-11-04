import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export class SelfSubjectRulesReviewApi extends KubeApi<SelfSubjectRulesReview> {
  create({ namespace = "default" }): Promise<SelfSubjectRulesReview> {
    return super.create({}, {
      spec: {
        namespace
      },
    }
    );
  }
}

export interface ISelfSubjectReviewRule {
  verbs: string[];
  apiGroups?: string[];
  resources?: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
}

export class SelfSubjectRulesReview extends KubeObject {
  static kind = "SelfSubjectRulesReview"
  static namespaced = false
  static apiBase = "/apis/authorization.k8s.io/v1/selfsubjectrulesreviews"

  spec: {
    // todo: add more types from api docs
    namespace?: string;
  }

  status: {
    resourceRules: ISelfSubjectReviewRule[];
    nonResourceRules: ISelfSubjectReviewRule[];
    incomplete: boolean;
  }

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
      })
    }
  }
}

export const selfSubjectRulesReviewApi = new SelfSubjectRulesReviewApi({
  objectConstructor: SelfSubjectRulesReview,
});
