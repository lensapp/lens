/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { computed } from "mobx";
import moment from "moment";
import updateDownloadedDateTimeInjectable from "../../../../common/update-downloaded-date-time.injectable";
import { reactiveNow } from "../../../../../../common/utils/reactive-now/reactive-now";

const timeSinceUpdateWasDownloadedInjectable = getInjectable({
  id: "time-since-update-was-downloaded",

  instantiate: (di) => {
    const updateDownloadedDateTime = di.inject(updateDownloadedDateTimeInjectable);

    return computed(() => {
      const currentTimestamp = reactiveNow();

      const downloadedAt = updateDownloadedDateTime.value.get();

      assert(downloadedAt);

      return currentTimestamp - (moment(downloadedAt).unix() * 1000);
    });
  },
});

export default timeSinceUpdateWasDownloadedInjectable;
