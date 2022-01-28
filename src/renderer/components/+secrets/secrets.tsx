/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./secrets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { AddSecretDialog } from "./add-dialog";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { SecretsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretStoreInjectable from "./store.injectable";
import type { SecretStore } from "./store";
import openAddSecretDialogInjectable from "./add-dialog-open.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  labels = "labels",
  keys = "keys",
  type = "type",
  age = "age",
}

export interface SecretsProps extends RouteComponentProps<SecretsRouteParams> {
}

interface Dependencies {
  secretStore: SecretStore;
  openAddSecretDialog: () => void;
}

const NonInjectedSecrets = observer(({ secretStore, openAddSecretDialog }: Dependencies & SecretsProps) => (
  <>
    <KubeObjectListLayout
      isConfigurable
      tableId="configuration_secrets"
      className="Secrets"
      store={secretStore}
      sortingCallbacks={{
        [columnId.name]: item => item.getName(),
        [columnId.namespace]: item => item.getNs(),
        [columnId.labels]: item => item.getLabels(),
        [columnId.keys]: item => item.getKeys(),
        [columnId.type]: item => item.type,
        [columnId.age]: item => item.getTimeDiffFromNow(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
        item => item.getKeys(),
      ]}
      renderHeaderTitle="Secrets"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { className: "warning", showWithColumn: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Labels", className: "labels scrollable", sortBy: columnId.labels, id: columnId.labels },
        { title: "Keys", className: "keys", sortBy: columnId.keys, id: columnId.keys },
        { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={secret => [
        secret.getName(),
        <KubeObjectStatusIcon key="icon" object={secret} />,
        secret.getNs(),
        secret.getLabels().map(label => <Badge scrollable key={label} label={label} expandable={false}/>),
        secret.getKeys().join(", "),
        secret.type,
        secret.getAge(),
      ]}
      addRemoveButtons={{
        onAdd: openAddSecretDialog,
        addTooltip: "Create new Secret",
      }}
    />
    <AddSecretDialog/>
  </>
));

export const Secrets = withInjectables<Dependencies, SecretsProps>(NonInjectedSecrets, {
  getProps: (di, props) => ({
    secretStore: di.inject(secretStoreInjectable),
    openAddSecretDialog: di.inject(openAddSecretDialogInjectable),
    ...props,
  }),
});
