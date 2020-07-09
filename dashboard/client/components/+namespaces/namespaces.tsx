import "./namespaces.scss";

import * as React from "react";
import { Trans } from "@lingui/macro";
import { Namespace, namespacesApi, NamespaceStatus } from "../../api/endpoints";
import { AddNamespaceDialog } from "./add-namespace-dialog";
import { MainLayout } from "../layout/main-layout";
import { Badge } from "../badge";
import { RouteComponentProps } from "react-router";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { NamespacesRouteParams } from "./namespaces.route";
import { namespaceStore } from "./namespace.store";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

interface Props extends RouteComponentProps<NamespacesRouteParams> {
}

export class Namespaces extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <MainLayout>
        <KubeObjectListLayout
          isClusterScoped
          className="Namespaces" store={namespaceStore}
          sortingCallbacks={{
            [sortBy.name]: (ns: Namespace): string => ns.getName(),
            [sortBy.labels]: (ns: Namespace): string[] => ns.getLabels(),
            [sortBy.age]: (ns: Namespace): string => ns.metadata.creationTimestamp,
            [sortBy.status]: (ns: Namespace): string => ns.getStatus(),
          }}
          searchFilters={[
            (item: Namespace): string[] => item.getSearchFields(),
            (item: Namespace): string => item.getStatus()
          ]}
          renderHeaderTitle={<Trans>Namespaces</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
            { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: Namespace): (string | JSX.Element[] | number | React.ReactNode)[] => [
            item.getName(),
            item.getLabels().map(label => <Badge key={label} label={label}/>),
            item.getAge(),
            { title: item.getStatus(), className: item.getStatus().toLowerCase() },
          ]}
          renderItemMenu={(item: Namespace): JSX.Element => {
            return <NamespaceMenu object={item}/>;
          }}
          addRemoveButtons={{
            addTooltip: <Trans>Add Namespace</Trans>,
            onAdd: (): void => AddNamespaceDialog.open(),
          }}
          customizeTableRowProps={(item: Namespace): { disabled: boolean } => ({
            disabled: item.getStatus() === NamespaceStatus.TERMINATING,
          })}
        />
        <AddNamespaceDialog/>
      </MainLayout>
    );
  }
}

export function NamespaceMenu(props: KubeObjectMenuProps<Namespace>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(namespacesApi, {
  Menu: NamespaceMenu,
});
