import "./secrets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Secret } from "../../api/endpoints";
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
          renderHeaderTitle="Secrets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { className: "warning" },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Labels", className: "labels", sortBy: sortBy.labels },
            { title: "Keys", className: "keys", sortBy: sortBy.keys },
            { title: "Type", className: "type", sortBy: sortBy.type },
            { title: "Age", className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(secret: Secret) => [
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
            addTooltip: "Create new Secret"
          }}
        />
        <AddSecretDialog/>
      </>
    );
  }
}
