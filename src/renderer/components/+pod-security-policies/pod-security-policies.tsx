/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-security-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { podSecurityPolicyStore } from "./legacy-store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

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
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="access_pod_security_policies"
          className="PodSecurityPolicies"
          store={podSecurityPolicyStore}
          sortingCallbacks={{
            [columnId.name]: podSecurityPolicy => podSecurityPolicy.getName(),
            [columnId.volumes]: podSecurityPolicy => podSecurityPolicy.getVolumes(),
            [columnId.privileged]: podSecurityPolicy => +podSecurityPolicy.isPrivileged(),
            [columnId.age]: podSecurityPolicy => -podSecurityPolicy.getCreationTimestamp(),
          }}
          searchFilters={[
            podSecurityPolicy => podSecurityPolicy.getSearchFields(),
            podSecurityPolicy => podSecurityPolicy.getVolumes(),
            podSecurityPolicy => Object.values(podSecurityPolicy.getRules()),
          ]}
          renderHeaderTitle="Pod Security Policies"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Privileged", className: "privileged", sortBy: columnId.privileged, id: columnId.privileged },
            { title: "Volumes", className: "volumes", sortBy: columnId.volumes, id: columnId.volumes },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={podSecurityPolicy => [
            podSecurityPolicy.getName(),
            <KubeObjectStatusIcon key="icon" object={podSecurityPolicy} />,
            podSecurityPolicy.isPrivileged() ? "Yes" : "No",
            podSecurityPolicy.getVolumes().join(", "),
            <KubeObjectAge key="age" object={podSecurityPolicy} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}
