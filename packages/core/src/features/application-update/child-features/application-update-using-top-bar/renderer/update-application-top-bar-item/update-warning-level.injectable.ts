/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updateDownloadedDateTimeInjectable from "../../../../common/update-downloaded-date-time.injectable";
import { reactiveNow } from "../../../../../../common/utils/reactive-now/reactive-now";

const updateWarningLevelInjectable = getInjectable({
  id: "update-warning-level",

  instantiate: (di) => {
    const updateDownloadedDateTime = di.inject(updateDownloadedDateTimeInjectable);

    return computed(() => {
      const downloadedAt = updateDownloadedDateTime.value.get();

      if (!downloadedAt) {
        return "";
      }

      const ONE_DAY = 1000 * 60 * 60 * 24;

      const downloadedAtTimestamp = new Date(downloadedAt).getTime();
      const currentDateTimeTimestamp = reactiveNow(ONE_DAY);

      const elapsedTime = currentDateTimeTimestamp - downloadedAtTimestamp;

      const elapsedDays = elapsedTime / ONE_DAY;

      if (elapsedDays < 20) {
        return "light";
      }

      if (elapsedDays >= 20 && elapsedDays < 25) {
        return "medium";
      }

      return "high";
    });
  },
});

export default updateWarningLevelInjectable;
