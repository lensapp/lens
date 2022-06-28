import { getInjectable } from "@ogre-tools/injectable";
import updateDownloadedDateInjectable from "./update-downloaded-date.injectable";
import { UpdateWarningLevelCalculator } from "./update-warning-level-calculator";
import updateWarningLevelInjectable from "../../../common/application-update/update-warning-level/update-warning-level.injectable";

const setUpdateWarningLevelInjectable = getInjectable({
  id: "set-update-warning",

  instantiate: (di) => {
    const updateDownloadedDate = di.inject(updateDownloadedDateInjectable);
    const updateWarningLevel = di.inject(updateWarningLevelInjectable);
    
    return () => {
      const newLevel = new UpdateWarningLevelCalculator(updateDownloadedDate.value.get()).get();
      updateWarningLevel.set(newLevel);
    }
  }
});

export default setUpdateWarningLevelInjectable;