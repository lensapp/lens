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

import "./role-details.scss";

import React from "react";
import { DrawerTitle } from "../drawer";
import { KubeEventDetails } from "../+events/kube-event-details";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { Role } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Role> {
}

@observer
export class RoleDetails extends React.Component<Props> {
  render() {
    const { object: role } = this.props;

    if (!role) return;
    const rules = role.getRules();

    return (
      <div className="RoleDetails">
        <KubeObjectMeta object={role}/>

        <DrawerTitle title="Rules"/>
        {rules.map(({ resourceNames, apiGroups, resources, verbs }, index) => {
          return (
            <div className="rule" key={index}>
              {resources && (
                <>
                  <div className="name">Resources</div>
                  <div className="value">{resources.join(", ")}</div>
                </>
              )}
              {verbs && (
                <>
                  <div className="name">Verbs</div>
                  <div className="value">{verbs.join(", ")}</div>
                </>
              )}
              {apiGroups && (
                <>
                  <div className="name">Api Groups</div>
                  <div className="value">
                    {apiGroups
                      .map(apiGroup => apiGroup === "" ? `'${apiGroup}'` : apiGroup)
                      .join(", ")
                    }
                  </div>
                </>
              )}
              {resourceNames && (
                <>
                  <div className="name">Resource Names</div>
                  <div className="value">{resourceNames.join(", ")}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Role",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleDetails {...props}/>
  }
});
kubeObjectDetailRegistry.add({
  kind: "Role",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "ClusterRole",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleDetails {...props}/>
  }
});
kubeObjectDetailRegistry.add({
  kind: "ClusterRole",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props}/>
  }
});
