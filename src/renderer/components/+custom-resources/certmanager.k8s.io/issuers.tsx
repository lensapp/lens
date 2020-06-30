import "./issuers.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../../kube-object/kube-object-menu";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../../kube-object";
import { clusterIssuersApi, Issuer, issuersApi } from "../../../api/endpoints/cert-manager.api";
import { cssNames } from "../../../utils";
import { Badge } from "../../badge";
import { Spinner } from "../../spinner";
import { apiManager } from "../../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  type = "type",
  labels = "labels",
  age = "age",
}

@observer
export class ClusterIssuers extends React.Component<KubeObjectListLayoutProps> {
  render() {
    const store = apiManager.getStore(clusterIssuersApi);
    return (
      <Issuers
        {...this.props}
        isClusterScoped={true}
        store={store}
        renderHeaderTitle={<Trans>Cluster Issuers</Trans>}
      />
    )
  }
}

@observer
export class Issuers extends React.Component<KubeObjectListLayoutProps> {
  render() {
    const { store = apiManager.getStore(issuersApi), ...layoutProps } = this.props;
    if (!store) {
      return <Spinner center/>
    }
    return (
      <KubeObjectListLayout
        store={store}
        renderHeaderTitle={<Trans>Issuers</Trans>}
        {...layoutProps}
        className="Issuers"
        sortingCallbacks={{
          [sortBy.name]: (item: Issuer) => item.getName(),
          [sortBy.namespace]: (item: Issuer) => item.getNs(),
          [sortBy.type]: (item: Issuer) => item.getType(),
          [sortBy.labels]: (item: Issuer) => item.getLabels(),
          [sortBy.age]: (item: Issuer) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: Issuer) => item.getSearchFields(),
          (item: Issuer) => item.getType(),
        ]}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
          { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status" },
        ]}
        renderTableContents={(issuer: Issuer) => [
          issuer.getName(),
          issuer.getNs(),
          issuer.getLabels().map(label => <Badge key={label} label={label} title={label}/>),
          issuer.getType(),
          issuer.getAge(),
          issuer.getConditions().map(({ type, tooltip, isReady }) => {
            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            )
          })
        ]}
        renderItemMenu={(item: Issuer) => {
          return <IssuerMenu object={item}/>
        }}
      />
    );
  }
}

export function IssuerMenu(props: KubeObjectMenuProps<Issuer>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews([issuersApi, clusterIssuersApi], {
  List: Issuers,
  Menu: IssuerMenu,
})
