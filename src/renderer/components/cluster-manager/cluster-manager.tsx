/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cluster-manager.scss";

import React from "react";
import { Redirect } from "react-router";
import { disposeOnUnmount, observer } from "mobx-react";
import { StatusBar } from "../status-bar/status-bar";
import { HotbarMenu } from "../hotbar/hotbar-menu";
import { DeleteClusterDialog } from "../delete-cluster-dialog";
import { withInjectables } from "@ogre-tools/injectable-react";
import { TopBar } from "../layout/top-bar/top-bar";
import catalogPreviousActiveTabStorageInjectable from "../+catalog/catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import type { IComputedValue } from "mobx";
import { reaction } from "mobx";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import { setEntityOnRouteMatch } from "../../api/helpers/general-active-sync";
import { navigation } from "../../navigation";
import welcomeRouteInjectable from "../../../common/front-end-routing/routes/welcome/welcome-route.injectable";
import { buildURL } from "../../../common/utils/buildUrl";
import type { StorageLayer } from "../../utils";

interface Dependencies {
  catalogPreviousActiveTabStorage: StorageLayer<string | null>;
  currentRouteComponent: IComputedValue<React.ElementType | undefined>;
  welcomeUrl: string;
}

@observer
class NonInjectedClusterManager extends React.Component<Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => navigation.location, () => setEntityOnRouteMatch(), { fireImmediately: true }),
    ]);
  }

  render() {
    const Component = this.props.currentRouteComponent.get();

    if (!Component) {
      return <Redirect exact to={this.props.welcomeUrl} />;
    }

    return (
      <div className="ClusterManager">
        <TopBar />
        <main>
          <div id="lens-views" />
          <Component />
        </main>
        <HotbarMenu />
        <StatusBar />
        <DeleteClusterDialog />
      </div>
    );
  }
}

export const ClusterManager = withInjectables<Dependencies>(NonInjectedClusterManager, {
  getProps: (di) => ({
    catalogPreviousActiveTabStorage: di.inject(catalogPreviousActiveTabStorageInjectable),
    currentRouteComponent: di.inject(currentRouteComponentInjectable),
    welcomeUrl: buildURL(di.inject(welcomeRouteInjectable).path),
  }),
});
