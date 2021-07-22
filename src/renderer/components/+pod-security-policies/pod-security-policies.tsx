/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./pod-security-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object";
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
