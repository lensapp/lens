/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-security-policy-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { PodSecurityPolicy } from "../../../common/k8s-api/endpoints";
import { Badge } from "../badge";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

export interface PodSecurityPolicyDetailsProps extends KubeObjectDetailsProps<PodSecurityPolicy> {
}

interface RuleGroup {
  rule: string;
  ranges?: {
    max: number;
    min: number;
  }[];
}

@observer
export class PodSecurityPolicyDetails extends React.Component<PodSecurityPolicyDetailsProps> {
  renderRuleGroup(title: React.ReactNode, group: RuleGroup | undefined) {
    if (!group) return null;
    const { rule, ranges } = group;

    return (
      <>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerItem name="Rule">
          {rule}
        </DrawerItem>
        {ranges && (
          <DrawerItem name="Ranges (Min-Max)" labelsOnly>
            {ranges.map(({ min, max }, index) => (
              <Badge
                key={index}
                label={`${min} - ${max}`}
              />
            ))}
          </DrawerItem>
        )}
      </>
    );
  }

  render() {
    const { object: psp } = this.props;

    if (!psp) {
      return null;
    }

    if (!(psp instanceof PodSecurityPolicy)) {
      logger.error("[PodSecurityPolicyDetails]: passed object that is not an instanceof PodSecurityPolicy", psp);

      return null;
    }

    const {
      allowedHostPaths, allowedCapabilities, allowedCSIDrivers, allowedFlexVolumes, allowedProcMountTypes,
      allowedUnsafeSysctls, allowPrivilegeEscalation, defaultAddCapabilities, forbiddenSysctls, fsGroup,
      hostIPC, hostNetwork, hostPID, hostPorts, privileged, readOnlyRootFilesystem, requiredDropCapabilities,
      runAsGroup, runAsUser, runtimeClass, seLinux, supplementalGroups, volumes,
    } = psp.spec;

    return (
      <div className="PodSecurityPolicyDetails">
        <KubeObjectMeta object={psp}/>

        {allowedCapabilities && (
          <DrawerItem name="Allowed Capabilities">
            {allowedCapabilities.join(", ")}
          </DrawerItem>
        )}

        {volumes && (
          <DrawerItem name="Volumes">
            {volumes.join(", ")}
          </DrawerItem>
        )}

        {allowedCSIDrivers && (
          <DrawerItem name="Allowed CSI Drivers">
            {allowedCSIDrivers.map(({ name }) => name).join(", ")}
          </DrawerItem>
        )}

        {allowedFlexVolumes && (
          <DrawerItem name="Allowed Flex Volumes">
            {allowedFlexVolumes.map(({ driver }) => driver).join(", ")}
          </DrawerItem>
        )}

        {allowedProcMountTypes && (
          <DrawerItem name="Allowed Proc Mount Types">
            {allowedProcMountTypes.join(", ")}
          </DrawerItem>
        )}

        {allowedUnsafeSysctls && (
          <DrawerItem name="Allowed Unsafe Sysctls">
            {allowedUnsafeSysctls.join(", ")}
          </DrawerItem>
        )}

        {forbiddenSysctls && (
          <DrawerItem name="Forbidden Sysctls">
            {forbiddenSysctls.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name="Allow Privilege Escalation">
          {allowPrivilegeEscalation ? "Yes" : "No"}
        </DrawerItem>

        <DrawerItem name="Privileged">
          {privileged ? "Yes" : "No"}
        </DrawerItem>

        <DrawerItem name="Read-only Root Filesystem">
          {readOnlyRootFilesystem ? "Yes" : "No"}
        </DrawerItem>

        {defaultAddCapabilities && (
          <DrawerItem name="Default Add Capabilities">
            {defaultAddCapabilities.join(", ")}
          </DrawerItem>
        )}

        {requiredDropCapabilities && (
          <DrawerItem name="Required Drop Capabilities">
            {requiredDropCapabilities.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name="Host IPC">
          {hostIPC ? "Yes" : "No"}
        </DrawerItem>

        <DrawerItem name="Host Network">
          {hostNetwork ? "Yes" : "No"}
        </DrawerItem>

        <DrawerItem name="Host PID">
          {hostPID ? "Yes" : "No"}
        </DrawerItem>

        {hostPorts && (
          <DrawerItem name="Host Ports (Min-Max)" labelsOnly>
            {hostPorts.map(({ min, max }, index) => {
              return <Badge key={index} label={`${min} - ${max}`}/>;
            })}
          </DrawerItem>
        )}

        {allowedHostPaths && (
          <>
            <DrawerTitle>Allowed Host Paths</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Path Prefix</TableCell>
                <TableCell>Read-only</TableCell>
              </TableHead>
              {
                allowedHostPaths.map(({ pathPrefix, readOnly }, index) => (
                  <TableRow key={index}>
                    <TableCell>{pathPrefix}</TableCell>
                    <TableCell>{readOnly ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))
              }
            </Table>
          </>
        )}

        {fsGroup && this.renderRuleGroup("Fs Group", fsGroup)}
        {runAsGroup && this.renderRuleGroup("Run As Group", runAsGroup)}
        {runAsUser && this.renderRuleGroup("Run As User", runAsUser)}
        {supplementalGroups && this.renderRuleGroup("Supplemental Groups", supplementalGroups)}

        {runtimeClass && (
          <>
            <DrawerTitle>Runtime Class</DrawerTitle>
            <DrawerItem name="Allowed Runtime Class Names">
              {runtimeClass.allowedRuntimeClassNames?.join(", ") || "-"}
            </DrawerItem>
            <DrawerItem name="Default Runtime Class Name">
              {runtimeClass.defaultRuntimeClassName || "-"}
            </DrawerItem>
          </>
        )}

        {seLinux && (
          <>
            <DrawerTitle>Se Linux</DrawerTitle>
            <DrawerItem name="Rule">
              {seLinux.rule}
            </DrawerItem>
            {seLinux.seLinuxOptions && (
              <>
                <DrawerItem name="Level">
                  {seLinux.seLinuxOptions.level}
                </DrawerItem>
                <DrawerItem name="Role">
                  {seLinux.seLinuxOptions.role}
                </DrawerItem>
                <DrawerItem name="Type">
                  {seLinux.seLinuxOptions.type}
                </DrawerItem>
                <DrawerItem name="User">
                  {seLinux.seLinuxOptions.user}
                </DrawerItem>
              </>
            )}
          </>
        )}

      </div>
    );
  }
}
