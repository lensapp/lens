import "./namespaces.scss";

import React from "react";
import { Namespace, NamespaceStatus } from "../../api/endpoints";
import { AddNamespaceDialog } from "./add-namespace-dialog";
import { TabLayout } from "../layout/tab-layout";
import { Badge } from "../badge";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { INamespacesRouteParams } from "./namespaces.route";
import { namespaceStore } from "./namespace.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
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
          isConfigurable
          tableId="namespaces"
          className="Namespaces" store={namespaceStore}
          sortingCallbacks={{
            [columnId.name]: (ns: Namespace) => ns.getName(),
            [columnId.labels]: (ns: Namespace) => ns.getLabels(),
            [columnId.age]: (ns: Namespace) => ns.getTimeDiffFromNow(),
            [columnId.status]: (ns: Namespace) => ns.getStatus(),
          }}
          searchFilters={[
            (item: Namespace) => item.getSearchFields(),
            (item: Namespace) => item.getStatus()
          ]}
          renderHeaderTitle="Namespaces"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Labels", className: "labels", sortBy: columnId.labels, id: columnId.labels },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={(item: Namespace) => [
            item.getName(),
            <KubeObjectStatusIcon key="icon" object={item} />,
            item.getLabels().map(label => <Badge key={label} label={label}/>),
            item.getAge(),
            { title: item.getStatus(), className: item.getStatus().toLowerCase() },
          ]}
          addRemoveButtons={{
            addTooltip: "Add Namespace",
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
