/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./storage.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { PersistentVolumes } from "../+storage-volumes";
import { StorageClasses } from "../+storage-classes";
import { PersistentVolumeClaims } from "../+storage-volume-claims";
import { isAllowedResource } from "../../../common/utils/allowed-resource";
import * as routes from "../../../common/routes";

@observer
export class Storage extends React.Component {
  static get tabRoutes() {
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
  }

  render() {
    return (
      <TabLayout className="Storage" tabs={Storage.tabRoutes}/>
    );
  }
}
