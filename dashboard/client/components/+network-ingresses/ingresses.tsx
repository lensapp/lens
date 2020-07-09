import "./ingresses.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { IngressRouteParams } from "./ingresses.route";
import { Ingress, ingressApi } from "../../api/endpoints/ingress.api";
import { ingressStore } from "./ingress.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { Trans } from "@lingui/macro";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<IngressRouteParams> {
}

@observer
export class Ingresses extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="Ingresses" store={ingressStore}
        sortingCallbacks={{
          [sortBy.name]: (ingress: Ingress): string => ingress.getName(),
          [sortBy.namespace]: (ingress: Ingress): string => ingress.getNs(),
          [sortBy.age]: (ingress: Ingress): string => ingress.metadata.creationTimestamp,
        }}
        searchFilters={[
          (ingress: Ingress): string[] => ingress.getSearchFields(),
          (ingress: Ingress): string => ingress.getPorts(),
        ]}
        renderHeaderTitle={<Trans>Ingresses</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Rules</Trans>, className: "rules" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(ingress: Ingress): (string | number | JSX.Element[])[] => [
          ingress.getName(),
          ingress.getNs(),
          ingress.getRoutes().map(route => <p key={route}>{route}</p>),
          ingress.getAge(),
        ]}
        renderItemMenu={(item: Ingress): JSX.Element => {
          return <IngressMenu object={item}/>;
        }}
        tableProps={{
          customRowHeights: (item: Ingress, lineHeight, paddings): number => {
            const lines = item.getRoutes().length || 1;
            return lines * lineHeight + paddings;
          }
        }}
      />
    );
  }
}

export function IngressMenu(props: KubeObjectMenuProps<Ingress>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(ingressApi, {
  Menu: IngressMenu
});
