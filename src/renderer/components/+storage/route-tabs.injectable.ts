/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { PersistentVolumes } from "../+storage-volumes";
import { StorageClasses } from "../+storage-classes";
import { PersistentVolumeClaims } from "../+storage-volume-claims";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import * as routes from "../../../common/routes";

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

function getRouteTabs({ isAllowedResource }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (isAllowedResource("persistentvolumeclaims")) {
      tabs.push({
        title: "Persistent Volume Claims",
        component: PersistentVolumeClaims,
        url: routes.volumeClaimsURL(),
        routePath: routes.volumeClaimsRoute.path.toString(),
      });
    }

    if (isAllowedResource("persistentvolumes")) {
      tabs.push({
        title: "Persistent Volumes",
        component: PersistentVolumes,
        url: routes.volumesURL(),
        routePath: routes.volumesRoute.path.toString(),
      });
    }

    if (isAllowedResource("storageclasses")) {
      tabs.push({
        title: "Storage Classes",
        component: StorageClasses,
        url: routes.storageClassesURL(),
        routePath: routes.storageClassesRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const storageRouteTabsInjectable = getInjectable({
  id: "storage-route-tabs",

  instantiate: (di) => getRouteTabs({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
});

export default storageRouteTabsInjectable;
