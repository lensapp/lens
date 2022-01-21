/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { asyncComputed } from "@ogre-tools/injectable-react";
import releaseInjectable from "./release.injectable";

const releaseDetailsInjectable = getInjectable({
  instantiate: (di) =>
    asyncComputed(async () => {
      const release = di.inject(releaseInjectable).value.get();

      return await getRelease(release.name, release.namespace);
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default releaseDetailsInjectable;
