import { getInjectable } from "@ogre-tools/injectable";
import createSyncBoxInjectable from "../../../common/utils/sync-box/create-sync-box.injectable";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

const updateWarningLevelInjectable = getInjectable({
  id: "update-warning-level",

  instantiate: (di) => {
    const createSyncBox = di.inject(createSyncBoxInjectable);

    return createSyncBox<"light" | "medium" | "high" | "">(
        "update-warning-level",
        "",
      );
  },

  injectionToken: syncBoxInjectionToken,
});

export default updateWarningLevelInjectable;