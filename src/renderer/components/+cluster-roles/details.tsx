/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React from "react";

import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterRole } from "../../../common/k8s-api/endpoints";
import { withInjectables } from "@ogre-tools/injectable-react";
import logger from "../../../common/logger";

export interface ClusterRoleDetailsProps extends KubeObjectDetailsProps<ClusterRole> {
}

interface Dependencies {

}

const NonInjectedClusterRoleDetails = observer(({ object: clusterRole }: Dependencies & ClusterRoleDetailsProps) => {
  if (!clusterRole) {
    return null;
  }

  if (!(clusterRole instanceof ClusterRole)) {
    logger.error("[ClusterRoleDetails]: passed object that is not an instanceof ClusterRole", clusterRole);

    return null;
  }

  return (
    <div className="ClusterRoleDetails">
      <KubeObjectMeta object={clusterRole}/>

      <DrawerTitle title="Rules"/>
      {
        clusterRole.getRules()
          .map(({ resourceNames, apiGroups, resources, verbs }, index) => (
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
                      .join(", ")}
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
          ))
      }
    </div>
  );
});

export const ClusterRoleDetails = withInjectables<Dependencies, ClusterRoleDetailsProps>(NonInjectedClusterRoleDetails, {
  getProps: (di, props) => ({

    ...props,
  }),
});

