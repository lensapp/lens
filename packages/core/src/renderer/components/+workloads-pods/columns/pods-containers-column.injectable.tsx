/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { cssNames } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import startCase from "lodash/startCase";
import React from "react";
import type { ContainerStateValues, Pod } from "../../../../common/k8s-api/endpoints";
import type { KubeObjectListLayoutColumn } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { kubeObjectListLayoutColumnInjectionToken } from "../../kube-object-list-layout/kube-object-list-layout-column-injection-token";
import { StatusBrick } from "../../status-brick";

function renderState(name: string, ready: boolean, key: string, data?: ContainerStateValues) {
  if (!data) {
    return;
  }

  return (
    <>
      <div className="title">
        {name}
        {" "}
        <span className="text-secondary">
          {key}
          {ready ? ", ready" : ""}
        </span>
      </div>
      {Object.entries(data).map(([name, value]) => (
        <React.Fragment key={name}>
          <div className="name">{startCase(name)}</div>
          <div className="value">{value}</div>
        </React.Fragment>
      ))}
    </>
  );
}

function renderContainersStatus(pod: Pod) {
  return pod.getContainerStatuses().map(({ name, state, ready }) => {
    return (
      <StatusBrick
        key={name}
        className={cssNames(state, { ready })}
        tooltip={{
          formatters: {
            tableView: true,
            nowrap: true,
          },
          children: (
            <>
              {renderState(name, ready, "running", state?.running)}
              {renderState(name, ready, "waiting", state?.waiting)}
              {renderState(name, ready, "terminated", state?.terminated)}
            </>
          ),
        }}
      />
    );
  });
}

export const podsContainersColumnInjectable = getInjectable({
  id: "pods-containers-column",
  instantiate: (): KubeObjectListLayoutColumn<Pod> => {
    const columnId = "containers";

    return {
      id: columnId,
      kind: "Pod",
      apiVersion: "v1",
      priority: 80,
      content: (pod: Pod) => {
        return renderContainersStatus(pod);
      },
      header: {
        title: "Containers",
        className: "containers",
        sortBy: columnId,
        id: columnId,
      },
      sortingCallBack: (pod: Pod) => pod.getContainerStatuses().length,
    };
  },
  injectionToken: kubeObjectListLayoutColumnInjectionToken,
});
