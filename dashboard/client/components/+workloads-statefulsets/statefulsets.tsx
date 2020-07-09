import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { StatefulSet, statefulSetApi } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { StatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps<StatefulSetsRouteParams> {
}

@observer
export class StatefulSets extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="StatefulSets" store={statefulSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (statefulSet: StatefulSet): string => statefulSet.getName(),
          [sortBy.namespace]: (statefulSet: StatefulSet): string => statefulSet.getNs(),
          [sortBy.age]: (statefulSet: StatefulSet): string => statefulSet.metadata.creationTimestamp,
          [sortBy.pods]: (statefulSet: StatefulSet): number => statefulSetStore.getChildPods(statefulSet).length,
        }}
        searchFilters={[
          (statefulSet: StatefulSet): string[] => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle={<Trans>Stateful Sets</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Pods</Trans>, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(statefulSet: StatefulSet): (string | number | JSX.Element)[] => [
          statefulSet.getName(),
          statefulSet.getNs(),
          statefulSetStore.getChildPods(statefulSet).length,
          <KubeEventIcon key="statefulSet" object={statefulSet}/>,
          statefulSet.getAge(),
        ]}
        renderItemMenu={(item: StatefulSet): JSX.Element => {
          return <StatefulSetMenu object={item}/>;
        }}
      />
    );
  }
}

export function StatefulSetMenu(props: KubeObjectMenuProps<StatefulSet>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(statefulSetApi, {
  Menu: StatefulSetMenu,
});
