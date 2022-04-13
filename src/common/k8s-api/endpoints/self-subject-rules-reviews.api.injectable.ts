/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { SelfSubjectRulesReviewApi } from "./self-subject-rules-reviews.api";

const selfSubjectRulesReviewApiInjectable = getInjectable({
  id: "self-subject-rules-review-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "selfSubjectRulesReviewApi is only available in certain environments");

    return new SelfSubjectRulesReviewApi();
  },
});

export default selfSubjectRulesReviewApiInjectable;
