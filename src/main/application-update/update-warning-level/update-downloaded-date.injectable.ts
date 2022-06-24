import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

const updateDownloadedDateInjectable = getInjectable({
  id: "update-downloaded-date",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<Date | null>(
        "update-downloaded-date",
        null,
      );
  },

  injectionToken: syncBoxInjectionToken,
});

export default updateDownloadedDateInjectable;