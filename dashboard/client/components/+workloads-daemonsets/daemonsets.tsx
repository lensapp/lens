import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { DaemonSet, daemonSetApi } from "../../api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { eventStore } from "../+events/event.store";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { nodesStore } from "../+nodes/nodes.store";
import { KubeObjectListLayout } from "../kube-object";
import { DaemonSetsRouteParams } from "../+workloads";
import { Trans } from "@lingui/macro";
import { Badge } from "../badge";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps<DaemonSetsRouteParams> {
}

@observer
export class DaemonSets extends React.Component<Props> {
  getPodsLength(daemonSet: DaemonSet): number {
    return daemonSetStore.getChildPods(daemonSet).length;
  }

  renderNodeSelector(daemonSet: DaemonSet): JSX.Element[] {
    return daemonSet.getNodeSelectors().map(selector => (
      <Badge key={selector} label={selector}/>
    ));
  }

  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="DaemonSets" store={daemonSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (daemonSet: DaemonSet): string => daemonSet.getName(),
          [sortBy.namespace]: (daemonSet: DaemonSet): string => daemonSet.getNs(),
          [sortBy.pods]: (daemonSet: DaemonSet): number => this.getPodsLength(daemonSet),
          [sortBy.age]: (daemonSet: DaemonSet): string => daemonSet.metadata.creationTimestamp,
        }}
        searchFilters={[
          (daemonSet: DaemonSet): string[] => daemonSet.getSearchFields(),
          (daemonSet: DaemonSet): string[] => daemonSet.getLabels(),
        ]}
        renderHeaderTitle={<Trans>Daemon Sets</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Pods</Trans>, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          { title: <Trans>Node Selector</Trans>, className: "labels" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(daemonSet: DaemonSet): (string | number | JSX.Element | JSX.Element[])[] => [
          daemonSet.getName(),
          daemonSet.getNs(),
          this.getPodsLength(daemonSet),
          <KubeEventIcon key="daemonSet" object={daemonSet}/>,
          this.renderNodeSelector(daemonSet),
          daemonSet.getAge(),
        ]}
        renderItemMenu={(item: DaemonSet): JSX.Element => {
          return <DaemonSetMenu object={item}/>;
        }}
      />
    );
  }
}

export function DaemonSetMenu(props: KubeObjectMenuProps<DaemonSet>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(daemonSetApi, {
  Menu: DaemonSetMenu,
});
