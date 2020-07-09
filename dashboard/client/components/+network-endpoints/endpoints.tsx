import "./endpoints.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { EndpointRouteParams } from "./endpoints.route";
import { Endpoint, endpointApi } from "../../api/endpoints/endpoint.api";
import { endpointStore } from "./endpoints.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { Trans } from "@lingui/macro";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<EndpointRouteParams> {
}

@observer
export class Endpoints extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="Endpoints" store={endpointStore}
        sortingCallbacks={{
          [sortBy.name]: (endpoint: Endpoint): string => endpoint.getName(),
          [sortBy.namespace]: (endpoint: Endpoint): string => endpoint.getNs(),
          [sortBy.age]: (endpoint: Endpoint): string => endpoint.metadata.creationTimestamp,
        }}
        searchFilters={[
          (endpoint: Endpoint): string[] => endpoint.getSearchFields()
        ]}
        renderHeaderTitle={<Trans>Endpoints</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Endpoints</Trans>, className: "endpoints" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(endpoint: Endpoint): (string | number)[] => [
          endpoint.getName(),
          endpoint.getNs(),
          endpoint.toString(),
          endpoint.getAge(),
        ]}
        renderItemMenu={(item: Endpoint): JSX.Element => {
          return <EndpointMenu object={item}/>;
        }}
        tableProps={{
          customRowHeights: (item: Endpoint, lineHeight, paddings): number => {
            const lines = item.getEndpointSubsets().length || 1;
            return lines * lineHeight + paddings;
          }
        }}
      />
    );
  }
}

export function EndpointMenu(props: KubeObjectMenuProps<Endpoint>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(endpointApi, {
  Menu: EndpointMenu
});
