/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getReleaseValues } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { asyncComputed } from "@ogre-tools/injectable-react";
import releaseInjectable from "./release.injectable";
import { Notifications } from "../../notifications";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";

const releaseValuesInjectable = getInjectable({
  instantiate: (di) =>
    asyncComputed(async () => {
      const release = di.inject(releaseInjectable).get();
      const userSuppliedValuesAreShown = di.inject(userSuppliedValuesAreShownInjectable).value;

      try {
        return await getReleaseValues(release.getName(), release.getNs(), !userSuppliedValuesAreShown) ?? "";
      } catch (error) {
        Notifications.error(`Failed to load values for ${release.getName()}: ${error}`);

        return "";
      }
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default releaseValuesInjectable;
