import { getInjectable } from "@ogre-tools/injectable";
import updateDownloadedDateInjectable from "./update-downloaded-date.injectable";

const setUpdateDownloadedDateInjectable = getInjectable({
  id: "set-update-downloaded-date",

  instantiate: (di) => {
    const downloadedDate = di.inject(updateDownloadedDateInjectable);

    return (date: Date) => {
      downloadedDate.set(date);
    }
  }
});

export default setUpdateDownloadedDateInjectable;