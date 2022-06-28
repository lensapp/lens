/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import updateDownloadedDateInjectable from "./update-downloaded-date.injectable";

const setUpdateDownloadedDateInjectable = getInjectable({
  id: "set-update-downloaded-date",

  instantiate: (di) => {
    const downloadedDate = di.inject(updateDownloadedDateInjectable);

    return (date: Date) => {
      downloadedDate.set(date);
    };
  },
});

export default setUpdateDownloadedDateInjectable;
