import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import { workloadURL, workloadStores } from "../+workloads";
import { namespaceStore } from "../+namespaces/namespace.store";
import { PageFiltersList } from "../item-object-list/page-filters-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select";
import { isAllowedResource, KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../../renderer/utils/rbac";
import { autobind } from "../../utils";
import { _i18n } from "../../i18n";

const resources: KubeResource[] = [
  "pods",
  "deployments",
  "statefulsets",
  "daemonsets",
  "jobs",
  "cronjobs",
];

@observer
export class OverviewStatuses extends React.Component {
  @autobind()
  renderWorkload(resource: KubeResource): React.ReactElement {
    const store = workloadStores[resource];
    const items = store.getAllByNs(namespaceStore.contextNs);
    return (
      <div className="workload" key={resource}>
        <div className="title">
          <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
        </div>
        <OverviewWorkloadStatus status={store.getStatuses(items)} />
      </div>
    );
  }

  render() {
    const workloads = resources
      .filter(isAllowedResource)
      .map(this.renderWorkload);

    return (
      <div className="OverviewStatuses">
        <div className="header flex gaps align-center">
          <h5 className="box grow"><Trans>Overview</Trans></h5>
          <NamespaceSelectFilter />
        </div>
        <PageFiltersList />
        <div className="workloads">
          {workloads}
        </div>
      </div>
    );
  }
}
