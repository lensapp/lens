/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-resources.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { IComputedValue } from "mobx";
import { computed, makeObservable } from "mobx";
import { crdStore } from "./crd.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { safeJSONPathValue } from "../../utils/jsonPath";
import { TabLayout } from "../layout/tab-layout-2";
import { withInjectables } from "@ogre-tools/injectable-react";
import customResourcesRouteParametersInjectable from "./custom-resources-route-parameters.injectable";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Dependencies {
  group: IComputedValue<string>;
  name: IComputedValue<string>;
}

@observer
class NonInjectedCrdResources extends React.Component<Dependencies> {
  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get crd() {
    return crdStore.getByGroup(this.props.group.get(), this.props.name.get());
  }

  @computed get store() {
    return apiManager.getStore(this.crd?.getResourceApiBase());
  }

  render() {
    const { crd, store } = this;

    if (!crd || !store) {
      return null;
    }

    const isNamespaced = crd.isNamespaced();
    const extraColumns = crd.getPrinterColumns(false);  // Cols with priority bigger than 0 are shown in details
    const version = crd.getPreferedVersion();

    return (
      <TabLayout>
        <KubeObjectListLayout
          isConfigurable
          key={`crd_resources_${crd.getResourceApiBase()}`}
          tableId="crd_resources"
          className="CrdResources"
          store={store}
          sortingCallbacks={{
            [columnId.name]: customResource => customResource.getName(),
            [columnId.namespace]: customResource => customResource.getNs(),
            [columnId.age]: customResource => -customResource.getCreationTimestamp(),
            ...Object.fromEntries(extraColumns.map(({ name, jsonPath }) => [
              name,
              customResource => safeJSONPathValue(customResource, jsonPath),
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
              className: name.toLowerCase(),
              sortBy: name,
              id: name,
            })),
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={customResource => [
            customResource.getName(),
            isNamespaced && customResource.getNs(),
            ...extraColumns.map((column) => safeJSONPathValue(customResource, column.jsonPath)),
            <KubeObjectAge key="age" object={customResource} />,
          ]}
          failedToLoadMessage={(
            <>
              <p>
                {`Failed to load ${crd.getPluralName()}`}
              </p>
              {!version.served && (
                <p>
                  {`Prefered version (${crd.getGroup()}/${version.name}) is not served`}
                </p>
              )}
            </>
          )}
        />
      </TabLayout>
    );
  }
}

export const CrdResources = withInjectables<Dependencies>(
  NonInjectedCrdResources,

  {
    getProps: (di) => {
      const routeParameters = di.inject(customResourcesRouteParametersInjectable);

      return {
        group: routeParameters.group,
        name: routeParameters.name,
      };
    },
  },
);

