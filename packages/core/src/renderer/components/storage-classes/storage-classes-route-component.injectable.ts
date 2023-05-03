/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { StorageClasses } from "./storage-classes";
import storageClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/storage-classes/storage-classes-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const storageClassesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "storage-classes-route-component",
  Component: StorageClasses,
  routeInjectable: storageClassesRouteInjectable,
});

export default storageClassesRouteComponentInjectable;
