/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PersistentVolumes } from "./volumes";

import persistentVolumesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volumes/persistent-volumes-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const persistentVolumesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "persistent-volumes-route-component",
  Component: PersistentVolumes,
  routeInjectable: persistentVolumesRouteInjectable,
});

export default persistentVolumesRouteComponentInjectable;
