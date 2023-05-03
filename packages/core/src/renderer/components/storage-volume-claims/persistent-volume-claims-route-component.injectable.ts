/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PersistentVolumeClaims } from "./volume-claims";
import persistentVolumeClaimsRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volume-claims/persistent-volume-claims-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const persistentVolumeClaimsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "persistent-volume-claims-route-component",
  Component: PersistentVolumeClaims,
  routeInjectable: persistentVolumeClaimsRouteInjectable,
});

export default persistentVolumeClaimsRouteComponentInjectable;
