import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/after-root-frame-is-ready-injection-token";
import downloadUpdateInjectable from "../download-update/download-update.injectable";
import periodicalCheckForUpdateWarningInjectable from "./periodical-check-for-update-warning.injectable";
import setUpdateDownloadedDateInjectable from "./set-update-downloaded-date.injectable";
import updateDownloadedDateInjectable from "./update-downloaded-date.injectable";

const startCheckingForUpdateWarningInjectable = getInjectable({
  id: "start-checking-for-update-warning",

  instantiate: (di) => {
    const downloadUpdate = di.inject(downloadUpdateInjectable);
    const updateDownloadedDate = di.inject(updateDownloadedDateInjectable);
    const setUpdateDownloadedDate = di.inject(setUpdateDownloadedDateInjectable);
    const periodicalCheckForUpdateWarning = di.inject(periodicalCheckForUpdateWarningInjectable);

    return {
      run: async () => {
        const { downloadWasSuccessful } = await downloadUpdate();

        if (downloadWasSuccessful) {
          if (!updateDownloadedDate.value.get()) {
            setUpdateDownloadedDate(new Date());
          }

          await periodicalCheckForUpdateWarning.start();
        }
      },
    };
  },

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default startCheckingForUpdateWarningInjectable;
