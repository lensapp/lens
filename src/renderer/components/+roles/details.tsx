/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React from "react";

import { Role } from "../../../common/k8s-api/endpoints";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { withInjectables } from "@ogre-tools/injectable-react";
import logger from "../../../common/logger";

export interface RoleDetailsProps extends KubeObjectDetailsProps<Role> {
}

interface Dependencies {

}

const NonInjectedRoleDetails = observer(({ object: role }: Dependencies & RoleDetailsProps) => {
  if (!role) {
    return null;
  }

  if (!(role instanceof Role)) {
    logger.error("[RoleDetails]: passed object that is not an instanceof Role", role);

    return null;
  }

  return (
    <div className="RoleDetails">
      <KubeObjectMeta object={role}/>
      <DrawerTitle title="Rules"/>
      {role.getRules().map(({ resourceNames, apiGroups, resources, verbs }, index) => (
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
      ))}
    </div>
  );
});

export const RoleDetails = withInjectables<Dependencies, RoleDetailsProps>(NonInjectedRoleDetails, {
  getProps: (di, props) => ({

    ...props,
  }),
});

