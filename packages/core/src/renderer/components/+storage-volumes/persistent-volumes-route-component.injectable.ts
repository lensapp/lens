/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PersistentVolumes } from "./volumes";

import persistentVolumesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volumes/persistent-volumes-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const persistentVolumesRouteComponentInjectable = getInjectable({
  id: "persistent-volumes-route-component",

  instantiate: (di) => ({
    route: di.inject(persistentVolumesRouteInjectable),
    Component: PersistentVolumes,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default persistentVolumesRouteComponentInjectable;
