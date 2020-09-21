import "./storage.scss"

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { TabLayout, TabRoute } from "../layout/tab-layout";
import { PersistentVolumes, volumesRoute, volumesURL } from "../+storage-volumes";
import { StorageClasses, storageClassesRoute, storageClassesURL } from "../+storage-classes";
import { PersistentVolumeClaims, volumeClaimsRoute, volumeClaimsURL } from "../+storage-volume-claims";
import { namespaceStore } from "../+namespaces/namespace.store";
import { storageURL } from "./storage.route";
import { isAllowedResource } from "../../../common/rbac";

interface Props extends RouteComponentProps<{}> {
}

@observer
export class Storage extends React.Component<Props> {
  static get tabRoutes() {
    const tabRoutes: TabRoute[] = [];
    const query = namespaceStore.getContextParams()

    tabRoutes.push({
      title: <Trans>Persistent Volume Claims</Trans>,
      component: PersistentVolumeClaims,
      url: volumeClaimsURL({ query }),
      path: volumeClaimsRoute.path,
    })

    if (isAllowedResource('persistentvolumes')) {
      tabRoutes.push({
        title: <Trans>Persistent Volumes</Trans>,
        component: PersistentVolumes,
        url: volumesURL(),
        path: volumesRoute.path,
      });
    }

    if (isAllowedResource('storageclasses')) {
      tabRoutes.push({
        title: <Trans>Storage Classes</Trans>,
        component: StorageClasses,
        url: storageClassesURL(),
        path: storageClassesRoute.path,
      })
    }
    return tabRoutes;
  }

  render() {
    const tabRoutes = Storage.tabRoutes;
    return (
      <TabLayout className="Storage" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={storageURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </TabLayout>
    )
  }
}
