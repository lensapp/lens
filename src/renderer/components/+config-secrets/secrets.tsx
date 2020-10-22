import "./secrets.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { Secret, secretsApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { AddSecretDialog } from "./add-secret-dialog";
import { ISecretsRouteParams } from "./secrets.route";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { secretsStore } from "./secrets.store";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  labels = "labels",
  keys = "keys",
  type = "type",
  age = "age",
}

interface Props extends RouteComponentProps<ISecretsRouteParams> {
}

@observer
export class Secrets extends React.Component<Props> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Secrets" store={secretsStore}
          sortingCallbacks={{
            [sortBy.name]: (item: Secret) => item.getName(),
            [sortBy.namespace]: (item: Secret) => item.getNs(),
            [sortBy.labels]: (item: Secret) => item.getLabels(),
            [sortBy.keys]: (item: Secret) => item.getKeys(),
            [sortBy.type]: (item: Secret) => item.type,
            [sortBy.age]: (item: Secret) => item.metadata.creationTimestamp,
          }}
          searchFilters={[
            (item: Secret) => item.getSearchFields(),
            (item: Secret) => item.getKeys(),
          ]}
          renderHeaderTitle={<Trans>Secrets</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Keys</Trans>, className: "keys", sortBy: sortBy.keys },
            { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(secret: Secret) => [
            secret.getName(),
            secret.getNs(),
            secret.getLabels().map(label => <Badge key={label} label={label}/>),
            secret.getKeys().join(", "),
            secret.type,
            secret.getAge(),
          ]}
          addRemoveButtons={{
            onAdd: () => AddSecretDialog.open(),
            addTooltip: <Trans>Create new Secret</Trans>
          }}
        />
        <AddSecretDialog/>
      </>
    );
  }
}
