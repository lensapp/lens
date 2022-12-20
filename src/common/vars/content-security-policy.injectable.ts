/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationInformationToken from "./application-information-token";

const contentSecurityPolicyInjectable = getInjectable({
  id: "content-security-policy",
  instantiate: (di) => di.inject(applicationInformationToken).config.contentSecurityPolicy,
});

export default contentSecurityPolicyInjectable;
