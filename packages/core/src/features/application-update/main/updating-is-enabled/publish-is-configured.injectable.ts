/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { applicationInformationToken } from "@k8slens/application";
import { getInjectable } from "@ogre-tools/injectable";

const publishIsConfiguredInjectable = getInjectable({
  id: "publish-is-configured",
  instantiate: (di) => di.inject(applicationInformationToken).updatingIsEnabled,
});

export default publishIsConfiguredInjectable;
