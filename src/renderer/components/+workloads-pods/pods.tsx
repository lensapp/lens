/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { Fragment } from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Link } from "react-router-dom";
import type { NodeApi, Pod } from "../../../common/k8s-api/endpoints";
import { StatusBrick } from "../status-brick";
import { cssNames, object, stopPropagation } from "../../utils";
import startCase from "lodash/startCase";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Badge } from "../badge";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import type { EventStore } from "../+events/store";
import type { PodStore } from "./store";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import podStoreInjectable from "./store.injectable";
import { List } from "../list/list";
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table'
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeToStoresDisposersInjectable from "../../kube-watch-api/subscribe-to-stores-disposers.injectable";
import { KubeObjectMenu } from "../kube-object-menu";
import toggleKubeDetailsPaneInjectable, { ToggleKubeDetailsPane } from "../kube-detail-params/toggle-details.injectable";

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
  eventStore: EventStore;
  podStore: PodStore;
  nodeApi: NodeApi;
  subscribeToWatchStores: SubscribeStores;
  toggleDetails: ToggleKubeDetailsPane;
}

const columnHelper = createColumnHelper<Pod>()

@observer
class NonInjectedPods extends React.Component<Dependencies> {
  componentDidMount() {
    const storeDisposer = this.props.subscribeToWatchStores([this.props.podStore, this.props.eventStore]);

    disposeOnUnmount(this, storeDisposer)
  }

  renderState<T extends string>(name: string, ready: boolean, key: string, data: Partial<Record<T, string | number>> | undefined) {
    return data && (
      <>
        <div className="title">
          {name}
          {" "}
          <span className="text-secondary">
            {key}
            {ready ? ", ready" : ""}
          </span>
        </div>
        {object.entries(data).map(([name, value]) => (
          <div key={name} className="flex gaps align-center">
            <div className="name">
              {startCase(name)}
            </div>
            <div className="value">
              {value}
            </div>
          </div>
        ))}
      </>
    );
  }

  renderContainersStatus(pod: Pod) {
    return pod.getContainerStatuses()
      .map(({ name, state = {}, ready }) => (
        <Fragment key={name}>
          <StatusBrick
            className={cssNames(state, { ready })}
            tooltip={{
              formatters: {
                tableView: true,
              },
              children: (
                <>
                  {this.renderState(name, ready, "running", state.running)}
                  {this.renderState(name, ready, "waiting", state.waiting)}
                  {this.renderState(name, ready, "terminated", state.terminated)}
                </>
              ),
            }}
          />
        </Fragment>
      ));
  }

  renderControlledBy(pod: Pod) {
    const { apiManager, getDetailsUrl } = this.props;

    return pod.getOwnerRefs().map(ref => {
      const { kind, name } = ref;
      const detailsLink = getDetailsUrl(apiManager.lookupApiLink(ref, pod));

      return (
        <Badge
          flat
          key={name}
          className="owner"
          tooltip={name}
        >
          <Link to={detailsLink} onClick={stopPropagation}>
            {kind}
          </Link>
        </Badge>
      );
    })
  }

  renderNodeName(pod: Pod) {
    const { getDetailsUrl, nodeApi } = this.props;

    return pod.getNodeName() ? (
      <Badge
        flat
        key="node"
        className="node"
        tooltip={pod.getNodeName()}
        expandable={false}
      >
        <Link to={getDetailsUrl(nodeApi.getUrl({ name: pod.getNodeName() }))} onClick={stopPropagation}>
          {pod.getNodeName()}
        </Link>
      </Badge>
    ) : ""
  }

  render() {
    const { podStore } = this.props;

    const columns = [
      columnHelper.accessor(row => row.getName(), {
        id: "name",
        header: "Name",
        cell: info => (
          // TODO: Multi-line table cells
          // <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
          //   {info.getValue()}
          // </span>
          <span>{info.getValue()}</span>
        ),
        size: 130,
      }),
      columnHelper.display({
        id: "warning",
        cell: props => <KubeObjectStatusIcon key="icon" object={props.row.original} />,
        size: 30,
        enableResizing: false,
      }),
      columnHelper.accessor(row => row.getNs(), {
        id: "namespace",
        header: "Namespace",
        cell: info => info.getValue(),
        minSize: 100,
        size: 100,
      }),
      columnHelper.accessor(row => this.renderContainersStatus(row), {
        id: "containers",
        header: "Containers",
        cell: info => info.getValue(),
        size: 100,
        minSize: 100,
      }),
      columnHelper.accessor(row => row.getRestartsCount(), {
        id: "restarts",
        header: "Restarts",
        cell: info => info.getValue(),
        minSize: 105,
      }),
      columnHelper.accessor(row => this.renderControlledBy(row), {
        id: "controlledBy",
        header: "Owners",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => this.renderNodeName(row), {
        id: "node",
        header: "Node",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => row.getQosClass(), {
        id: "qos",
        header: "QoS",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => <KubeObjectAge key="age" object={row} />, {
        id: "age",
        header: "Age",
        cell: info => info.renderValue(),
      }),
      columnHelper.accessor(row => row.getStatusMessage(), {
        id: "status",
        header: "Status",
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        size: 30,
        cell: row => <KubeObjectMenu object={row.row.original} />,
        enableResizing: false,
      })
    ]

    return (
      <SiblingsInTabLayout>
        <List
          columns={columns}
          data={podStore.contextItems}
          title="Pods"
          filters={[
            pod => pod.getSearchFields(),
            pod => pod.getStatusMessage(),
            pod => pod.status?.podIP || "",
            pod => pod.getNodeName() || "",
          ]}
          onRowClick={(item) => this.props.toggleDetails(item.selfLink)}
          getCoreRowModel={getCoreRowModel()}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Pods = withInjectables<Dependencies>(NonInjectedPods, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    nodeApi: di.inject(nodeApiInjectable),
    eventStore: di.inject(eventStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    subscribeToWatchStores: di.inject(subscribeToStoresDisposersInjectable),
    toggleDetails: di.inject(toggleKubeDetailsPaneInjectable),
  }),
});
