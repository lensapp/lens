/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import selectedUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/selected-update-channel.injectable";
import appVersionInjectable from "../../../common/vars/app-version.injectable";
import { SemVer } from "semver";

const updateCanBeDowngradedInjectable = getInjectable({
  id: "update-can-be-downgraded",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const appVersion = di.inject(appVersionInjectable);

    return computed(() => {
      const semVer = new SemVer(appVersion);

      return (
        semVer.prerelease[0] !==
        selectedUpdateChannel.value.get().id
      );
    });
  },
});

export default updateCanBeDowngradedInjectable;
