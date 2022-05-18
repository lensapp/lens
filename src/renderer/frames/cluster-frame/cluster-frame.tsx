/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useEffect } from "react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { Redirect } from "react-router";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { DeploymentScaleDialog } from "../../components/+workloads-deployments/scale/dialog";
import { CronJobTriggerDialog } from "../../components/+workloads-cronjobs/cronjob-trigger-dialog";
import { StatefulSetScaleDialog } from "../../components/+workloads-statefulsets/scale/dialog";
import { ReplicaSetScaleDialog } from "../../components/+workloads-replicasets/scale-dialog/dialog";
import { CommandContainer } from "../../components/command-palette/command-container";
import { ErrorBoundary } from "../../components/error-boundary";
import { MainLayout } from "../../components/layout/main-layout";
import { Notifications } from "../../components/notifications";
import { KubeObjectDetails } from "../../components/kube-object-details";
import { KubeConfigDialog } from "../../components/kubeconfig-dialog";
import { Sidebar } from "../../components/layout/sidebar";
import { Dock } from "../../components/dock";
import { watchHistoryState } from "../../remote-helpers/history-updater";
import { PortForwardDialog } from "../../port-forward";
import { DeleteClusterDialog } from "../../components/delete-cluster-dialog";
import type { NamespaceStore } from "../../components/+namespaces/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable  from "../../components/+namespaces/store.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import { disposer } from "../../utils";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import startUrlInjectable from "./start-url.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

interface Dependencies {
  namespaceStore: NamespaceStore;
  currentRouteComponent: IComputedValue<React.ElementType<{}> | undefined | null>;
  startUrl: IComputedValue<string>;
  subscribeStores: SubscribeStores;
}

export const NonInjectedClusterFrame = observer(({
  namespaceStore,
  currentRouteComponent,
  startUrl,
  subscribeStores,
}: Dependencies) => {
  useEffect(() => disposer(
    subscribeStores([
      namespaceStore,
    ]),
    watchHistoryState(),
  ), []);

  const Component = currentRouteComponent.get();

  return (
    <ErrorBoundary>
      <MainLayout
        sidebar={<Sidebar />}
        footer={<Dock />}
      >
        {
          Component
            ? <Component />
            : <Redirect to={startUrl.get()} />
        }
      </MainLayout>

      <Notifications />
      <ConfirmDialog />
      <KubeObjectDetails />
      <KubeConfigDialog />
      <DeploymentScaleDialog />
      <StatefulSetScaleDialog />
      <ReplicaSetScaleDialog />
      <CronJobTriggerDialog />
      <PortForwardDialog />
      <DeleteClusterDialog />
      <CommandContainer />
    </ErrorBoundary>
  );
});

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    startUrl: di.inject(startUrlInjectable),
    currentRouteComponent: di.inject(currentRouteComponentInjectable),
  }),
});

ClusterFrame.displayName = "ClusterFrame";
