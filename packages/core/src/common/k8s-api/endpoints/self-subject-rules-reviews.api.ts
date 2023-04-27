/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SelfSubjectRulesReview } from "@k8slens/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";

export class SelfSubjectRulesReviewApi extends KubeApi<SelfSubjectRulesReview> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: SelfSubjectRulesReview,
    });
  }

  create({ namespace = "default" }) {
    return super.create({}, {
      spec: {
        namespace,
      },
    });
  }
}
