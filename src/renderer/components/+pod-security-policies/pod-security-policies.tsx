/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-security-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { podSecurityPoliciesStore } from "./pod-security-policies.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  volumes = "volumes",
  privileged = "privileged",
  age = "age",
}

@observer
export class PodSecurityPolicies extends React.Component {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="access_pod_security_policies"
        className="PodSecurityPolicies"
        store={podSecurityPoliciesStore}
        sortingCallbacks={{
          [columnId.name]: item => item.getName(),
          [columnId.volumes]: item => item.getVolumes(),
          [columnId.privileged]: item => +item.isPrivileged(),
          [columnId.age]: item => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          item => item.getSearchFields(),
          item => item.getVolumes(),
          item => Object.values(item.getRules()),
        ]}
        renderHeaderTitle="Pod Security Policies"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Privileged", className: "privileged", sortBy: columnId.privileged, id: columnId.privileged },
          { title: "Volumes", className: "volumes", sortBy: columnId.volumes, id: columnId.volumes },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={item => {
          return [
            item.getName(),
            <KubeObjectStatusIcon key="icon" object={item} />,
            item.isPrivileged() ? "Yes" : "No",
            item.getVolumes().join(", "),
            item.getAge(),
          ];
        }}
      />
    );
  }
}
