import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import setUpdateWarningLevelInjectable from "./set-update-warning-level.injectable";

const periodicalCheckForUpdateWarningInjectable = getInjectable({
  id: "periodical-check-for-update-warning",

  instantiate: (di) => {
    const processCheckingForUpdateWarning = di.inject(setUpdateWarningLevelInjectable);

    return getStartableStoppable("periodical-check-for-update-warning", () => {
      const ONCE_A_DAY = 1000 * 60 * 60 * 24;

      processCheckingForUpdateWarning();

      const intervalId = setInterval(() => {
        processCheckingForUpdateWarning();
      }, ONCE_A_DAY);

      return () => {
        clearInterval(intervalId);
      };
    });
  },

  causesSideEffects: true,
});

export default periodicalCheckForUpdateWarningInjectable;