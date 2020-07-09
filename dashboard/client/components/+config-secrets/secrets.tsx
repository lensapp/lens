import "./secrets.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { Secret, secretsApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { AddSecretDialog } from "./add-secret-dialog";
import { SecretsRouteParams } from "./secrets.route";
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

interface Props extends RouteComponentProps<SecretsRouteParams> {
}

@observer
export class Secrets extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <>
        <KubeObjectListLayout
          className="Secrets" store={secretsStore}
          sortingCallbacks={{
            [sortBy.name]: (item: Secret): string => item.getName(),
            [sortBy.namespace]: (item: Secret): string => item.getNs(),
            [sortBy.labels]: (item: Secret): string[] => item.getLabels(),
            [sortBy.keys]: (item: Secret): string[] => item.getKeys(),
            [sortBy.type]: (item: Secret): string => item.type,
            [sortBy.age]: (item: Secret): string => item.metadata.creationTimestamp,
          }}
          searchFilters={[
            (item: Secret): string[] => item.getSearchFields(),
            (item: Secret): string[] => item.getKeys(),
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
          renderTableContents={(secret: Secret): (string | JSX.Element[] | number)[] => [
            secret.getName(),
            secret.getNs(),
            secret.getLabels().map(label => <Badge key={label} label={label}/>),
            secret.getKeys().join(", "),
            secret.type,
            secret.getAge(),
          ]}
          renderItemMenu={(item: Secret): JSX.Element => {
            return <SecretMenu object={item}/>;
          }}
          addRemoveButtons={{
            onAdd: (): void => AddSecretDialog.open(),
            addTooltip: <Trans>Create new Secret</Trans>
          }}
        />
        <AddSecretDialog/>
      </>
    );
  }
}

export function SecretMenu(props: KubeObjectMenuProps<Secret>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(secretsApi, {
  Menu: SecretMenu,
});
