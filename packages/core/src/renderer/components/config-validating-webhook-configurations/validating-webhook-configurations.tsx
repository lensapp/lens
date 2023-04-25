/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import type { ValidatingWebhookConfigurationStore } from "./validating-webhook-configuration-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import validatingWebhookConfigurationsStoreInjectable from "./validating-webhook-configuration-store.injectable";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  webhooks = "webhooks",
  age = "age",
}

interface Dependencies {
  store: ValidatingWebhookConfigurationStore;
}

const NonInjectedValidatingWebhookConfigurations = observer((props: Dependencies) => {
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
        tableId="config_validating_webhook_configurations"
        className={"ValidatingWebhookConfigurations"}
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
        renderHeaderTitle="Validating Webhook Configs"
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

export const ValidatingWebhookConfigurations = withInjectables<Dependencies>(NonInjectedValidatingWebhookConfigurations, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(validatingWebhookConfigurationsStoreInjectable),
  }),
});
