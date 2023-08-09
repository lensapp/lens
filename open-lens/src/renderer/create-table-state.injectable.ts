import { createTableStateInjectionToken } from "@k8slens/table";
import { getInjectable } from "@ogre-tools/injectable";

const createTableStateInjectable = getInjectable({
  id: "open-lens-table-state",
  instantiate: () => () => {},
  injectionToken: createTableStateInjectionToken,
});

export default createTableStateInjectable