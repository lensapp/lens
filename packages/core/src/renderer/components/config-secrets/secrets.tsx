/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./secrets.scss";

import React from "react";
import { observer } from "mobx-react";
import { AddSecretDialog } from "./add-dialog/view";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { SecretStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretStoreInjectable from "./store.injectable";
import openAddSecretDialogInjectable from "./add-dialog/open.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  labels = "labels",
  keys = "keys",
  type = "type",
  age = "age",
}

interface Dependencies {
  secretStore: SecretStore;
  openAddSecretDialog: () => void;
}

@observer
class NonInjectedSecrets extends React.Component<Dependencies> {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_secrets"
          className="Secrets"
          store={this.props.secretStore}
          sortingCallbacks={{
            [columnId.name]: secret => secret.getName(),
            [columnId.namespace]: secret => secret.getNs(),
            [columnId.labels]: secret => secret.getLabels(),
            [columnId.keys]: secret => secret.getKeys(),
            [columnId.type]: secret => secret.type,
            [columnId.age]: secret => -secret.getCreationTimestamp(),
          }}
          searchFilters={[
            secret => secret.getSearchFields(),
            secret => secret.getKeys(),
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
            <NamespaceSelectBadge
              key="namespace"
              namespace={secret.getNs()}
            />,
            secret.getLabels().map(label => (
              <Badge
                scrollable
                key={label}
                label={label}
                expandable={false}
              />
            )),
            secret.getKeys().join(", "),
            secret.type,
            <KubeObjectAge key="age" object={secret} />,
          ]}
          addRemoveButtons={{
            onAdd: this.props.openAddSecretDialog,
            addTooltip: "Create new Secret",
          }}
        />
        <AddSecretDialog/>
      </SiblingsInTabLayout>
    );
  }
}

export const Secrets = withInjectables<Dependencies>(NonInjectedSecrets, {
  getProps: (di, props) => ({
    ...props,
    secretStore: di.inject(secretStoreInjectable),
    openAddSecretDialog: di.inject(openAddSecretDialogInjectable),
  }),
});
