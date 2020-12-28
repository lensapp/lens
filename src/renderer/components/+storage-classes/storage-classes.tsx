import "./storage-classes.scss";

import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { StorageClass } from "../../api/endpoints/storage-class.api";
import { KubeObjectListLayout } from "../kube-object";
import { IStorageClassesRouteParams } from "./storage-classes.route";
import { storageClassStore } from "./storage-class.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  age = "age",
  provisioner = "provision",
  reclaimPolicy = "reclaim",
}

interface Props extends RouteComponentProps<IStorageClassesRouteParams> {
}

@observer
export class StorageClasses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="StorageClasses"
        store={storageClassStore} isClusterScoped
        sortingCallbacks={{
          [sortBy.name]: (item: StorageClass) => item.getName(),
          [sortBy.age]: (item: StorageClass) => item.metadata.creationTimestamp,
          [sortBy.provisioner]: (item: StorageClass) => item.provisioner,
          [sortBy.reclaimPolicy]: (item: StorageClass) => item.reclaimPolicy,
        }}
        searchFilters={[
          (item: StorageClass) => item.getSearchFields(),
          (item: StorageClass) => item.provisioner,
        ]}
        renderHeaderTitle="Storage Classes"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Provisioner", className: "provisioner", sortBy: sortBy.provisioner },
          { title: "Reclaim Policy", className: "reclaim-policy", sortBy: sortBy.reclaimPolicy },
          { title: "Default", className: "is-default" },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(storageClass: StorageClass) => [
          storageClass.getName(),
          <KubeObjectStatusIcon key="icon" object={storageClass} />,
          storageClass.provisioner,
          storageClass.getReclaimPolicy(),
          storageClass.isDefault() ? "Yes" : null,
          storageClass.getAge(),
        ]}
      />
    );
  }
}
