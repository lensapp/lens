/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { SelfSubjectRulesReviewApi } from "./self-subject-rules-review.api";

const selfSubjectRulesReviewApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/authorization.k8s.io/v1/selfsubjectrulesreviews") as SelfSubjectRulesReviewApi,
  lifecycle: lifecycleEnum.singleton,
});

export default selfSubjectRulesReviewApiInjectable;
