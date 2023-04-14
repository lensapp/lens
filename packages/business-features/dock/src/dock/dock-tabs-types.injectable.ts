import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { dockTabInjectionToken } from "../dock-tab";

const dockTabTypesInjectable = getInjectable({
  id: "dock-tab-types",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computedInjectMany(dockTabInjectionToken);
  },
});

export default dockTabTypesInjectable;
