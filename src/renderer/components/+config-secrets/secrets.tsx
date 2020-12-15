import "./secrets.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { AddSecretDialog } from "./add-secret-dialog";
import { ISecretsRouteParams } from "./secrets.route";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { secretsStore } from "./secrets.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

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
          className="Secrets"
          store={secretsStore}
          sortingCallbacks={{
            [sortBy.name]: secret => secret.getName(),
            [sortBy.namespace]: secret => secret.getNs(),
            [sortBy.labels]: secret => secret.getLabels(),
            [sortBy.keys]: secret => secret.getKeys(),
            [sortBy.type]: secret => secret.type,
            [sortBy.age]: secret => secret.metadata.creationTimestamp,
          }}
          searchFilters={[
            secret => secret.getSearchFields(),
            secret => secret.getKeys(),
          ]}
          renderHeaderTitle={<Trans>Secrets</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Labels</Trans>, className: "labels", sortBy: sortBy.labels },
            { title: <Trans>Keys</Trans>, className: "keys", sortBy: sortBy.keys },
            { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
            { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={secret => [
            secret.getName(),
            <KubeObjectStatusIcon key="icon" object={secret} />,
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
