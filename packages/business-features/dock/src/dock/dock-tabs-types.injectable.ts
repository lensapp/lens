import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { dockTabTypeInjectionToken } from "../dock-tab-type";

const dockTabTypesInjectable = getInjectable({
  id: "dock-tab-types",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computedInjectMany(dockTabTypeInjectionToken);
  },
});

export default dockTabTypesInjectable;
