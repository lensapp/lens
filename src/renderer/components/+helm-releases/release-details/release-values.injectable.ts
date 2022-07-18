/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import releaseInjectable from "./release.injectable";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";
import getHelmReleaseValuesInjectable from "../../../k8s/helm-releases.api/get-values.injectable";
import showErrorNotificationInjectable from "../../notifications/show-error-notification.injectable";

const releaseValuesInjectable = getInjectable({
  id: "release-values",

  instantiate: (di) => {
    const getHelmReleaseValues = di.inject(getHelmReleaseValuesInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const userSuppliedValuesAreShown = di.inject(userSuppliedValuesAreShownInjectable);

    return asyncComputed(async () => {
      const release = di.inject(releaseInjectable).get();

      // TODO: Figure out way to get rid of defensive code
      if (!release) {
        return "";
      }

      try {
        return await getHelmReleaseValues(release.getName(), release.getNs(), !userSuppliedValuesAreShown.value) ?? "";
      } catch (error) {
        showErrorNotification(`Failed to load values for ${release.getName()}: ${error}`);

        return "";
      }
    });
  },
});

export default releaseValuesInjectable;
