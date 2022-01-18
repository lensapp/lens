/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-resources.scss";

import React from "react";
import jsonPath from "jsonpath";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { computed, makeObservable } from "mobx";
import { crdStore } from "./crd.store";
import type { TableSortCallbacks } from "../table";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { parseJsonPath } from "../../utils/jsonPath";
import type { CRDRouteParams } from "../../../common/routes";

interface Props extends RouteComponentProps<CRDRouteParams> {
}

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

@observer
export class CrdResources extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @computed get crd() {
    const { group, name } = this.props.match.params;

    return crdStore.getByGroup(group, name);
  }

  @computed get store() {
    return apiManager.getStore(this.crd?.getResourceApiBase());
  }

  render() {
    const { crd, store } = this;

    if (!crd) return null;
    const isNamespaced = crd.isNamespaced();
    const extraColumns = crd.getPrinterColumns(false);  // Cols with priority bigger than 0 are shown in details
    const sortingCallbacks: TableSortCallbacks<KubeObject> = {
      [columnId.name]: item => item.getName(),
      [columnId.namespace]: item => item.getNs(),
      [columnId.age]: item => item.getTimeDiffFromNow(),
    };

    extraColumns.forEach(column => {
      sortingCallbacks[column.name] = item => jsonPath.value(item, parseJsonPath(column.jsonPath.slice(1)));
    });

    const version = crd.getPreferedVersion();
    const loadFailedPrefix = <p>Failed to load {crd.getPluralName()}</p>;
    const failedToLoadMessage = version.served
      ? loadFailedPrefix
      : (
        <>
          {loadFailedPrefix}
          <p>Prefered version ({crd.getGroup()}/{version.name}) is not served</p>
        </>
      );

    return (
      <KubeObjectListLayout
        isConfigurable
        key={`crd_resources_${crd.getResourceApiBase()}`}
        tableId="crd_resources"
        className="CrdResources"
        store={store}
        sortingCallbacks={sortingCallbacks}
        searchFilters={[
          item => item.getSearchFields(),
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
          isNamespaced && { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          ...extraColumns.map(column => {
            const { name } = column;

            return {
              title: name,
              className: name.toLowerCase(),
              sortBy: name,
              id: name,
            };
          }),
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={crdInstance => [
          crdInstance.getName(),
          isNamespaced && crdInstance.getNs(),
          ...extraColumns.map((column) => {
            let value = jsonPath.value(crdInstance, parseJsonPath(column.jsonPath.slice(1)));

            if (Array.isArray(value) || typeof value === "object") {
              value = JSON.stringify(value);
            }

            return {
              renderBoolean: true,
              children: value,
            };
          }),
          crdInstance.getAge(),
        ]}
        failedToLoadMessage={failedToLoadMessage}
      />
    );
  }
}
