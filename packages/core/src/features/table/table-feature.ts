import { getFeature } from "@k8slens/feature-core";
import tableComponentInjectable from "./table-component.injectable";

export const tableFeature = getFeature({
  id: "core-table-feature",

  register: (di) => {
    di.register(tableComponentInjectable);
  },
});