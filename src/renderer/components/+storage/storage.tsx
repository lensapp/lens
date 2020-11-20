import "./storage.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { PersistentVolumes, volumesRoute, volumesURL } from "../+storage-volumes";
import { StorageClasses, storageClassesRoute, storageClassesURL } from "../+storage-classes";
import { PersistentVolumeClaims, volumeClaimsRoute, volumeClaimsURL } from "../+storage-volume-claims";
import { namespaceStore } from "../+namespaces/namespace.store";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class Storage extends React.Component {
  static get tabRoutes() {
    const tabRoutes: TabLayoutRoute[] = [];
    const query = namespaceStore.getContextParams();

    tabRoutes.push({
      title: <Trans>Persistent Volume Claims</Trans>,
      component: PersistentVolumeClaims,
      url: volumeClaimsURL({ query }),
      routePath: volumeClaimsRoute.path.toString(),
    });

    if (isAllowedResource('persistentvolumes')) {
      tabRoutes.push({
        title: <Trans>Persistent Volumes</Trans>,
        component: PersistentVolumes,
        url: volumesURL(),
        routePath: volumesRoute.path.toString(),
      });
    }

    if (isAllowedResource('storageclasses')) {
      tabRoutes.push({
        title: <Trans>Storage Classes</Trans>,
        component: StorageClasses,
        url: storageClassesURL(),
        routePath: storageClassesRoute.path.toString(),
      });
    }
    return tabRoutes;
  }

  render() {
    return (
      <TabLayout className="Storage" tabs={Storage.tabRoutes}/>
    );
  }
}
