/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { computed } from "mobx";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { formatJSONValue, safeJSONPathValue } from "@k8slens/utilities";
import { TabLayout } from "../layout/tab-layout-2";
import { withInjectables } from "@ogre-tools/injectable-react";
import { KubeObjectAge } from "../kube-object/age";
import type { CustomResourceDefinitionStore } from "../custom-resource-definitions/store";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import customResourceDefinitionStoreInjectable from "../custom-resource-definitions/store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import type { TableCellProps } from "@k8slens/list-layout";
import type { ParametersFromRouteInjectable } from "../../../common/front-end-routing/front-end-route-injection-token";
import type customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources-route.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  apiManager: ApiManager;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

export interface CustomResourcesProps {
  params: ParametersFromRouteInjectable<typeof customResourcesRouteInjectable>;
}

@observer
class NonInjectedCustomResources extends React.Component<Dependencies & CustomResourcesProps> {
  readonly crd = computed(() => {
    if (this.props.params.group && this.props.params.name) {
      return this.props.customResourceDefinitionStore.getByGroup(this.props.params.group, this.props.params.name);
    }

    return undefined;
  });

  readonly store = computed(() => this.props.apiManager.getStore(this.crd.get()?.getResourceApiBase()));

  render() {
    const crd = this.crd.get();
    const store = this.store.get();

    if (!crd || !store) {
      return null;
    }

    const isNamespaced = crd.isNamespaced();
    const extraColumns = crd.getPrinterColumns(false);  // Cols with priority bigger than 0 are shown in details
    const version = crd.getPreferredVersion();

    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          key={`crd_resources_${crd.getResourceApiBase()}`}
          tableId="crd_resources"
          className="CustomResources"
          store={store}
          sortingCallbacks={{
            [columnId.name]: customResource => customResource.getName(),
            [columnId.namespace]: customResource => customResource.getNs(),
            [columnId.age]: customResource => -customResource.getCreationTimestamp(),
            ...Object.fromEntries(extraColumns.map(({ name, jsonPath }) => [
              name,
              customResource => formatJSONValue(safeJSONPathValue(customResource, jsonPath)),
            ])),
          }}
          searchFilters={[
            customResource => customResource.getSearchFields(),
          ]}
          renderHeaderTitle={crd.getResourceKind()}
          customizeHeader={({ searchProps, ...headerPlaceholders }) => ({
            searchProps: {
              ...searchProps,
              placeholder: `${crd.getResourceKind()} search ...`,
            },
            ...headerPlaceholders,
          })}
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            isNamespaced
              ? { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace }
              : undefined,
            ...extraColumns.map(({ name }) => ({
              title: name,
              className: name.toLowerCase().replace(/\s+/g, "-"),
              sortBy: name,
              id: name,
              "data-testid": `custom-resource-column-title-${name.toLowerCase().replace(/\s+/g, "-")}`,
            })),
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={customResource => [
            customResource.getName(),
            isNamespaced && (
              <NamespaceSelectBadge namespace={customResource.getNs() as string} />
            ),
            ...extraColumns.map((column): TableCellProps => ({
              "data-testid": `custom-resource-column-cell-${column.name.toLowerCase().replace(/\s+/g, "-")}-for-${customResource.getScopedName()}`,
              title: formatJSONValue(safeJSONPathValue(customResource, column.jsonPath)),
            })),
            <KubeObjectAge key="age" object={customResource} />,
          ]}
          failedToLoadMessage={(
            <>
              <p>
                {`Failed to load ${crd.getPluralName()}`}
              </p>
              {!version.served && (
                <p>
                  {`Preferred version (${crd.getGroup()}/${version.name}) is not served`}
                </p>
              )}
            </>
          )}
        />
      </TabLayout>
    );
  }
}

export const CustomResources = withInjectables<Dependencies, CustomResourcesProps>(NonInjectedCustomResources, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
  }),
});

