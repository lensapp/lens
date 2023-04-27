/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React from "react";

import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import type { ClusterRole } from "@k8slens/kube-object";

export interface ClusterRoleDetailsProps extends KubeObjectDetailsProps<ClusterRole> {
}

@observer
export class ClusterRoleDetails extends React.Component<ClusterRoleDetailsProps> {
  render() {
    const { object: clusterRole } = this.props;

    if (!clusterRole) return null;
    const rules = clusterRole.getRules();

    return (
      <div className="ClusterRoleDetails">
        <DrawerTitle>Rules</DrawerTitle>
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
