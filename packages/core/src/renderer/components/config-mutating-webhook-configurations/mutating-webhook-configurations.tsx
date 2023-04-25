/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import type { MutatingWebhookConfigurationStore } from "./mutating-webhook-configuration-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import mutatingWebhookConfigurationsStoreInjectable from "./mutating-webhook-configuration-store.injectable";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  webhooks = "webhooks",
  age = "age",
}

interface Dependencies {
  store: MutatingWebhookConfigurationStore;
}

const NonInjectedMutatingWebhookConfigurations = observer((props: Dependencies) => {
  return (
    <SiblingsInTabLayout>
      <KubeObjectListLayout
        isConfigurable
        customizeHeader={({ searchProps, ...rest }) => ({
          ...rest,
          searchProps: {
            ...searchProps,
            placeholder: "Search...",
          },
        })}
        tableId="config_mutating_webhook_configurations"
        className={"MutatingWebhookConfigurations"}
        store={props.store}
        sortingCallbacks={{
          [columnId.name]: item => item.getName(),
          [columnId.webhooks]: item => item.getWebhooks().length,
          [columnId.age]: item => -item.getCreationTimestamp(),
        }}
        searchFilters={[
          item => item.getSearchFields(),
          item => item.getLabels(),
        ]}
        renderHeaderTitle="Mutating Webhook Configs"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          {
            title: "Webhooks",
            sortBy: columnId.webhooks,
            id: columnId.webhooks,
          },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={item => [
          item.getName(),
          item.getWebhooks().length,
          <KubeObjectAge key="age" object={item} />,
        ]}
      />
    </SiblingsInTabLayout>
  );
});

export const MutatingWebhookConfigurations = withInjectables<Dependencies>(NonInjectedMutatingWebhookConfigurations, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(mutatingWebhookConfigurationsStoreInjectable),
  }),
});
