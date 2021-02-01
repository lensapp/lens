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

enum columnId {
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
          isConfigurable
          tableId="configuration_secrets"
          className="Secrets" store={secretsStore}
          sortingCallbacks={{
            [columnId.name]: (item: Secret) => item.getName(),
            [columnId.namespace]: (item: Secret) => item.getNs(),
            [columnId.labels]: (item: Secret) => item.getLabels(),
            [columnId.keys]: (item: Secret) => item.getKeys(),
            [columnId.type]: (item: Secret) => item.type,
            [columnId.age]: (item: Secret) => item.metadata.creationTimestamp,
          }}
          searchFilters={[
            (item: Secret) => item.getSearchFields(),
            (item: Secret) => item.getKeys(),
          ]}
          renderHeaderTitle="Secrets"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Labels", className: "labels", sortBy: columnId.labels, id: columnId.labels },
            { title: "Keys", className: "keys", sortBy: columnId.keys, id: columnId.keys },
            { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
