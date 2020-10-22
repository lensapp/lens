import "./role-details.scss"

import React from "react";
import { Trans } from "@lingui/macro";
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

        <DrawerTitle title={<Trans>Rules</Trans>}/>
        {rules.map(({ resourceNames, apiGroups, resources, verbs }, index) => {
          return (
            <div className="rule" key={index}>
              {resources && (
                <>
                  <div className="name"><Trans>Resources</Trans></div>
                  <div className="value">{resources.join(", ")}</div>
                </>
              )}
              {verbs && (
                <>
                  <div className="name"><Trans>Verbs</Trans></div>
                  <div className="value">{verbs.join(", ")}</div>
                </>
              )}
              {apiGroups && (
                <>
                  <div className="name"><Trans>Api Groups</Trans></div>
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
                  <div className="name"><Trans>Resource Names</Trans></div>
                  <div className="value">{resourceNames.join(", ")}</div>
                </>
              )}
            </div>
          )
        })}

        <KubeEventDetails object={role}/>
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "Role",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleDetails {...props}/>
  }
})

kubeObjectDetailRegistry.add({
  kind: "ClusterRole",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleDetails {...props}/>
  }
})
