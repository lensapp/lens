/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { cssNames } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import startCase from "lodash/startCase";
import React from "react";
import type { ContainerStateValues, Pod } from "@k8slens/kube-object";
import { podListLayoutColumnInjectionToken } from "@k8slens/list-layout";
import { StatusBrick } from "../../status-brick";

const renderState = (name: string, ready: boolean, key: string, data?: ContainerStateValues) => (
  data && (
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
  )
);

const renderContainersStatus = (pod: Pod) => (
  <>
    {
      pod.getContainerStatuses()
        .map(({ name, state, ready }) => (
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
        ))
    }
  </>
);

const columnId = "containers";

export const podsContainersColumnInjectable = getInjectable({
  id: "pods-containers-column",
  instantiate: () => ({
    id: columnId,
    kind: "Pod",
    apiVersion: "v1",
    priority: 80,
    content: renderContainersStatus,
    header: {
      title: "Containers",
      className: "containers",
      sortBy: columnId,
      id: columnId,
    },
    sortingCallBack: (pod) => pod.getContainerStatuses().length,
  }),
  injectionToken: podListLayoutColumnInjectionToken,
});
