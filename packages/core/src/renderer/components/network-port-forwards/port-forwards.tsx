/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./port-forwards.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list/list-layout";
import type { PortForwardItem, PortForwardStore } from "../../port-forward";
import { PortForwardMenu } from "./port-forward-menu";
import { PortForwardDetails } from "./port-forward-details";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { computed } from "mobx";
import type { NavigateToPortForwards } from "../../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";
import navigateToPortForwardsInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import type { ParametersFromRouteInjectable } from "../../../common/front-end-routing/front-end-route-injection-token";
import type portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  kind = "kind",
  port = "port",
  forwardPort = "forwardPort",
  protocol = "protocol",
  status = "status",
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  navigateToPortForwards: NavigateToPortForwards;
}

export interface PortForwardsProps {
  params: ParametersFromRouteInjectable<typeof portForwardsRouteInjectable>;
}

@observer
class NonInjectedPortForwards extends React.Component<Dependencies & PortForwardsProps> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.portForwardStore.watch(),
    ]);
  }

  readonly selectedPortForward = computed(() => {
    const forwardPort = this.props.params.forwardPort;

    if (!forwardPort) {
      return undefined;
    }

    return this.props.portForwardStore.getById(forwardPort);
  });

  onDetails = (item: PortForwardItem) => {
    if (item === this.selectedPortForward.get()) {
      this.hideDetails();
    } else {
      this.showDetails(item);
    }
  };

  showDetails = (item: PortForwardItem) => {
    this.props.navigateToPortForwards({
      forwardPort: item.getId(),
    });
  };

  hideDetails = () => {
    this.props.navigateToPortForwards();
  };

  renderRemoveDialogMessage(selectedItems: PortForwardItem[]) {
    const forwardPorts = selectedItems.map(item => item.getForwardPort()).join(", ");

    return (
      <div>
        <>
          {"Stop forwarding from "}
          <b>{forwardPorts}</b>
          ?
        </>
      </div>
    );
  }


  render() {
    const selectedPortForward = this.selectedPortForward.get();

    return (
      <SiblingsInTabLayout>
        <ItemListLayout<PortForwardItem, false>
          isConfigurable
          tableId="port_forwards"
          className="PortForwards"
          preloadStores={false}
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
            <NamespaceSelectBadge
              key="namespace"
              namespace={item.getNs()}
            />,
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
          detailsItem={selectedPortForward}
          onDetails={this.onDetails}
        />
        {selectedPortForward && (
          <PortForwardDetails
            portForward={selectedPortForward}
            hideDetails={this.hideDetails}
          />
        )}
      </SiblingsInTabLayout>
    );
  }
}

export const PortForwards = withInjectables<Dependencies, PortForwardsProps>(NonInjectedPortForwards, {
  getProps: (di, props) => ({
    ...props,
    portForwardStore: di.inject(portForwardStoreInjectable),
    navigateToPortForwards: di.inject(navigateToPortForwardsInjectable),
  }),
});

