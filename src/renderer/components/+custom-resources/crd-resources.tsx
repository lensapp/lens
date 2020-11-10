import "./crd-resources.scss";

import React from "react";
import jsonPath from "jsonpath";
import { disposeOnUnmount, observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { KubeObject } from "../../api/kube-object";
import { ICRDRouteParams } from "./crd.route";
import { autorun, computed } from "mobx";
import { crdStore } from "./crd.store";
import { TableSortCallback } from "../table";
import { apiManager } from "../../api/api-manager";

interface Props extends RouteComponentProps<ICRDRouteParams> {
}

enum sortBy {
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
          store.loadAll();
        }
      })
    ])
  }

  @computed get crd() {
    const { group, name } = this.props.match.params;
    return crdStore.getByGroup(group, name);
  }

  @computed get store() {
    if (!this.crd) return null
    return apiManager.getStore(this.crd.getResourceApiBase());
  }

  render() {
    const { crd, store } = this;
    if (!crd) return null;
    const isNamespaced = crd.isNamespaced();
    const extraColumns = crd.getPrinterColumns(false);  // Cols with priority bigger than 0 are shown in details
    const sortingCallbacks: { [sortBy: string]: TableSortCallback } = {
      [sortBy.name]: (item: KubeObject) => item.getName(),
      [sortBy.namespace]: (item: KubeObject) => item.getNs(),
      [sortBy.age]: (item: KubeObject) => item.metadata.creationTimestamp,
    }
    extraColumns.forEach(column => {
      sortingCallbacks[column.name] = (item: KubeObject) => jsonPath.value(item, column.jsonPath.slice(1))
    })

    return (
      <KubeObjectListLayout
        className="CrdResources"
        isClusterScoped={!isNamespaced}
        store={store}
        sortingCallbacks={sortingCallbacks}
        searchFilters={[
          (item: KubeObject) => item.getSearchFields(),
        ]}
        renderHeaderTitle={crd.getResourceTitle()}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          isNamespaced && { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          ...extraColumns.map(column => {
            const { name } = column;
            return {
              title: name,
              className: name.toLowerCase(),
              sortBy: name
            }
          }),
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(crdInstance: KubeObject) => [
          crdInstance.getName(),
          isNamespaced && crdInstance.getNs(),
          ...extraColumns.map(column => ({
            renderBoolean: true,
            children: jsonPath.value(crdInstance, column.jsonPath.slice(1)),
          })),
          crdInstance.getAge(),
        ]}
      />
    )
  }
}
