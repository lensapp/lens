import "./crd-resources.scss";

import React from "react";
import jsonPath from "jsonpath";
import { disposeOnUnmount, observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { KubeObject } from "../../api/kube-object";
import { ICRDRouteParams } from "./crd.route";
import { autorun, computed } from "mobx";
import { crdStore } from "./crd.store";
import { TableSortCallback } from "../table";
import { apiManager } from "../../api/api-manager";
import { parseJsonPath } from "../../utils/jsonPath";

interface Props extends RouteComponentProps<ICRDRouteParams> {
}

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

@observer
export class CrdResources extends React.Component<Props> {
  componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { store } = this;

        if (store && !store.isLoading && !store.isLoaded) {
          store.loadSelectedNamespaces();
        }
      })
    ]);
  }

  @computed get crd() {
    const { group, name } = this.props.match.params;

    return crdStore.getByGroup(group, name);
  }

  @computed get store() {
    if (!this.crd) return null;

    return apiManager.getStore(this.crd.getResourceApiBase());
  }

  render() {
    const { crd, store } = this;

    if (!crd) return null;
    const isNamespaced = crd.isNamespaced();
    const extraColumns = crd.getPrinterColumns(false);  // Cols with priority bigger than 0 are shown in details
    const sortingCallbacks: { [sortBy: string]: TableSortCallback } = {
      [columnId.name]: (item: KubeObject) => item.getName(),
      [columnId.namespace]: (item: KubeObject) => item.getNs(),
      [columnId.age]: (item: KubeObject) => item.metadata.creationTimestamp,
    };

    extraColumns.forEach(column => {
      sortingCallbacks[column.name] = (item: KubeObject) => jsonPath.value(item, parseJsonPath(column.jsonPath.slice(1)));
    });

    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="crd_resources"
        className="CrdResources"
        isClusterScoped={!isNamespaced}
        store={store}
        sortingCallbacks={sortingCallbacks}
        searchFilters={[
          (item: KubeObject) => item.getSearchFields(),
        ]}
        renderHeaderTitle={crd.getResourceTitle()}
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          isNamespaced && { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          ...extraColumns.map(column => {
            const { name } = column;

            return {
              title: name,
              className: name.toLowerCase(),
              sortBy: name,
              id: name
            };
          }),
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(crdInstance: KubeObject) => [
          crdInstance.getName(),
          isNamespaced && crdInstance.getNs(),
          ...extraColumns.map((column) => {
            let value = jsonPath.value(crdInstance, parseJsonPath(column.jsonPath.slice(1)));

            if (Array.isArray(value) || typeof value === "object") {
              value = JSON.stringify(value);
            }

            return {
              renderBoolean: true,
              children: value,
            };
          }),
          crdInstance.getAge(),
        ]}
      />
    );
  }
}
