/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { tableComponentInjectionToken } from "@k8slens/table";
import { getInjectable } from "@ogre-tools/injectable";
import { Table } from "@k8slens/core/renderer";

const tableComponentInjectable = getInjectable({
  id: "table-component",
  instantiate: () => ({ Component: Table }),
  injectionToken: tableComponentInjectionToken,
});

export default tableComponentInjectable;
