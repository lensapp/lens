import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron/electron-app.injectable";

const whenAppIsReadyInjectable = getInjectable({
  id: "when-app-is-ready",

  instantiate: (di) => {
    const electronApp = di.inject(electronAppInjectable);

    return () => electronApp.whenReady();
  },

  decorable: false,
});

export default whenAppIsReadyInjectable;
