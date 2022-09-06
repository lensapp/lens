/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import selectedUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/selected-update-channel.injectable";
import currentReleaseIdInjectable from "../../../common/vars/release-channel.injectable";

const updateCanBeDowngradedInjectable = getInjectable({
  id: "update-can-be-downgraded",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const releaseChannel = di.inject(currentReleaseIdInjectable);

    return computed(() => {
      if (!releaseChannel) {
        return false;
      }

      const currentSelectedChannel = selectedUpdateChannel.value.get().id;

      if (currentSelectedChannel !== "latest") {
        return false;
      }

      return releaseChannel !== "latest";
    });
  },
});

export default updateCanBeDowngradedInjectable;
