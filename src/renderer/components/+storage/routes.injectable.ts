/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { KubeResource } from "../../../common/rbac";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { PersistentVolumes } from "../+persistent-volumes";
import { StorageClasses } from "../+storage-classes";
import { PersistentVolumeClaims } from "../+persistent-volume-claims";
import * as routes from "../../../common/routes";

interface Dependencies {
  isAllowedResource: (resource: KubeResource) => boolean;
}

function getRoutes({ isAllowedResource }: Dependencies): IComputedValue<TabLayoutRoute[]> {
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

const storageRoutesInjectable = getInjectable({
  instantiate: (di) => getRoutes({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default storageRoutesInjectable;
