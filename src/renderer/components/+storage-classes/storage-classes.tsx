import "./storage-classes.scss";

import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { StorageClass } from "../../api/endpoints/storage-class.api";
import { KubeObjectListLayout } from "../kube-object";
import { IStorageClassesRouteParams } from "./storage-classes.route";
import { storageClassStore } from "./storage-class.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  age = "age",
  provisioner = "provision",
  default = "default",
  reclaimPolicy = "reclaim",
}

interface Props extends RouteComponentProps<IStorageClassesRouteParams> {
}

@observer
export class StorageClasses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="storage_classes"
        className="StorageClasses"
        store={storageClassStore} isClusterScoped
        sortingCallbacks={{
          [columnId.name]: (item: StorageClass) => item.getName(),
          [columnId.age]: (item: StorageClass) => item.getTimeDiffFromNow(),
          [columnId.provisioner]: (item: StorageClass) => item.provisioner,
          [columnId.reclaimPolicy]: (item: StorageClass) => item.reclaimPolicy,
        }}
        searchFilters={[
          (item: StorageClass) => item.getSearchFields(),
          (item: StorageClass) => item.provisioner,
        ]}
        renderHeaderTitle="Storage Classes"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Provisioner", className: "provisioner", sortBy: columnId.provisioner, id: columnId.provisioner },
          { title: "Reclaim Policy", className: "reclaim-policy", sortBy: columnId.reclaimPolicy, id: columnId.reclaimPolicy },
          { title: "Default", className: "is-default", id: columnId.default },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
