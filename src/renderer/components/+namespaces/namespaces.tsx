import "./namespaces.scss";

import React from "react";
import { Trans } from "@lingui/macro";
import { Namespace, NamespaceStatus } from "../../api/endpoints";
import { AddNamespaceDialog } from "./add-namespace-dialog";
import { TabLayout } from "../layout/tab-layout";
import { Badge } from "../badge";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { INamespacesRouteParams } from "./namespaces.route";
import { namespaceStore } from "./namespace.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

interface Props extends RouteComponentProps<INamespacesRouteParams> {
}

export class Namespaces extends React.Component<Props> {
  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          isClusterScoped
          className="Namespaces" store={namespaceStore}
          sortingCallbacks={{
            [sortBy.name]: (ns: Namespace) => ns.getName(),
            [sortBy.labels]: (ns: Namespace) => ns.getLabels(),
            [sortBy.age]: (ns: Namespace) => ns.metadata.creationTimestamp,
            [sortBy.status]: (ns: Namespace) => ns.getStatus(),
          }}
          searchFilters={[
            (item: Namespace) => item.getSearchFields(),
            (item: Namespace) => item.getStatus()
          ]}
          renderHeaderTitle={<Trans>Namespaces</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
            { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: Namespace) => [
            item.getName(),
            <KubeObjectStatusIcon object={item} />,
            item.getLabels().map(label => <Badge key={label} label={label}/>),
            item.getAge(),
            { title: item.getStatus(), className: item.getStatus().toLowerCase() },
          ]}
          addRemoveButtons={{
            addTooltip: <Trans>Add Namespace</Trans>,
            onAdd: () => AddNamespaceDialog.open(),
          }}
          customizeTableRowProps={(item: Namespace) => ({
            disabled: item.getStatus() === NamespaceStatus.TERMINATING,
          })}
        />
        <AddNamespaceDialog/>
      </TabLayout>
    );
  }
}
