/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SelfSignedCert } from "selfsigned";

const kubeAuthCertCacheInjectable = getInjectable({
  id: "kube-auth-cert-cache",
  instantiate: () => new Map<string, SelfSignedCert>(),
});

export default kubeAuthCertCacheInjectable;
