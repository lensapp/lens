/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { IComputedValue } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Redirect } from "react-router";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { DeploymentScaleDialog } from "../../components/+workloads-deployments/deployment-scale-dialog";
import { CronJobTriggerDialog } from "../../components/+workloads-cronjobs/cronjob-trigger-dialog";
import { StatefulSetScaleDialog } from "../../components/+workloads-statefulsets/statefulset-scale-dialog";
import { ReplicaSetScaleDialog } from "../../components/+workloads-replicasets/replicaset-scale-dialog";
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
import type { NamespaceStore } from "../../components/+namespaces/namespace-store/namespace.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable  from "../../components/+namespaces/namespace-store/namespace-store.injectable";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import startUrlInjectable from "./start-url.injectable";

interface Dependencies {
  namespaceStore: NamespaceStore;
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  currentRouteComponent: IComputedValue<React.ElementType>;
  startUrl: IComputedValue<string>;
}

@observer
class NonInjectedClusterFrame extends React.Component<Dependencies> {
  static displayName = "ClusterFrame";

  constructor(props: Dependencies) {
    super(props);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.namespaceStore,
      ]),
      watchHistoryState(),
    ]);
  }

  render() {
    const Component = this.props.currentRouteComponent.get();

    if (!Component) {
      return <Redirect to={this.props.startUrl.get()} />;
    }

    return (
      <ErrorBoundary>
        <MainLayout sidebar={<Sidebar />} footer={<Dock />}>
          <Component />
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
  }
}

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
    startUrl: di.inject(startUrlInjectable),
    currentRouteComponent: di.inject(currentRouteComponentInjectable),
  }),
});
