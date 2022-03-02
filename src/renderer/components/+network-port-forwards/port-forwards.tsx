/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./port-forwards.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import { ItemListLayout } from "../item-object-list/list-layout";
import type { PortForwardItem, PortForwardStore } from "../../port-forward";
import { PortForwardMenu } from "./port-forward-menu";
import { PortForwardsRouteParams, portForwardsURL } from "../../../common/routes";
import { PortForwardDetails } from "./port-forward-details";
import { navigation } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  kind = "kind",
  port = "port",
  forwardPort = "forwardPort",
  protocol = "protocol",
  status = "status",
}

export interface PortForwardsProps extends RouteComponentProps<PortForwardsRouteParams> {
}

interface Dependencies {
  portForwardStore: PortForwardStore;
}

@observer
class NonInjectedPortForwards extends React.Component<PortForwardsProps & Dependencies> {

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.portForwardStore.watch(),
    ]);
  }

  get selectedPortForward() {
    const { match: { params: { forwardport }}} = this.props;

    return this.props.portForwardStore.getById(forwardport);
  }

  onDetails = (item: PortForwardItem) => {
    if (item === this.selectedPortForward) {
      this.hideDetails();
    } else {
      this.showDetails(item);
    }
  };

  showDetails = (item: PortForwardItem) => {
    navigation.push(portForwardsURL({
      params: {
        forwardport: item.getId(),
      },
    }));
  };

  hideDetails = () => {
    navigation.push(portForwardsURL());
  };

  renderRemoveDialogMessage(selectedItems: PortForwardItem[]) {
    const forwardPorts = selectedItems.map(item => item.getForwardPort()).join(", ");

    return (
      <div>
        <>Stop forwarding from <b>{forwardPorts}</b>?</>
      </div>
    );
  }


  render() {
    return (
      <>
        <ItemListLayout
          isConfigurable
          tableId="port_forwards"
          className="PortForwards"
          store={this.props.portForwardStore}
          getItems={() => this.props.portForwardStore.items}
          sortingCallbacks={{
            [columnId.name]: item => item.getName(),
            [columnId.namespace]: item => item.getNs(),
            [columnId.kind]: item => item.getKind(),
            [columnId.port]: item => item.getPort(),
            [columnId.forwardPort]: item => item.getForwardPort(),
            [columnId.protocol]: item => item.getProtocol(),
            [columnId.status]: item => item.getStatus(),
          }}
          searchFilters={[
            item => item.getSearchFields(),
          ]}
          renderHeaderTitle="Port Forwarding"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Kind", className: "kind", sortBy: columnId.kind, id: columnId.kind },
            { title: "Pod Port", className: "port", sortBy: columnId.port, id: columnId.port },
            { title: "Local Port", className: "forwardPort", sortBy: columnId.forwardPort, id: columnId.forwardPort },
            { title: "Protocol", className: "protocol", sortBy: columnId.protocol, id: columnId.protocol },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={item => [
            item.getName(),
            item.getNs(),
            item.getKind(),
            item.getPort(),
            item.getForwardPort(),
            item.getProtocol(),
            { title: item.getStatus(), className: item.getStatus().toLowerCase() },
          ]}
          renderItemMenu={pf => (
            <PortForwardMenu
              portForward={pf}
              removeConfirmationMessage={this.renderRemoveDialogMessage([pf])}
            />
          )}
          customizeRemoveDialog={selectedItems => ({
            message: this.renderRemoveDialogMessage(selectedItems),
          })}
          detailsItem={this.selectedPortForward}
          onDetails={this.onDetails}
        />
        {this.selectedPortForward && (
          <PortForwardDetails
            portForward={this.selectedPortForward}
            hideDetails={this.hideDetails}
          />
        )}
      </>
    );
  }
}

export const PortForwards = withInjectables<Dependencies, PortForwardsProps>(
  NonInjectedPortForwards,

  {
    getProps: (di, props) => ({
      portForwardStore: di.inject(portForwardStoreInjectable),
      ...props,
    }),
  },
);

