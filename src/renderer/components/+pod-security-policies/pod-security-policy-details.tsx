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

import "./pod-security-policy-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object";
import type { PodSecurityPolicy } from "../../api/endpoints";
import { Badge } from "../badge";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<PodSecurityPolicy> {
}

@observer
export class PodSecurityPolicyDetails extends React.Component<Props> {
  renderRuleGroup(
    title: React.ReactNode,
    group: {
      rule: string;
      ranges?: { max: number; min: number }[];
    }) {
    if (!group) return null;
    const { rule, ranges } = group;

    return (
      <>
        <DrawerTitle title={title}/>
        <DrawerItem name="Rule">
          {rule}
        </DrawerItem>
        {ranges && (
          <DrawerItem name="Ranges (Min-Max)" labelsOnly>
            {ranges.map(({ min, max }, index) => {
              return <Badge key={index} label={`${min} - ${max}`}/>;
            })}
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
            <DrawerTitle title="Allowed Host Paths"/>
            <Table>
              <TableHead>
                <TableCell>Path Prefix</TableCell>
                <TableCell>Read-only</TableCell>
              </TableHead>
              {allowedHostPaths.map(({ pathPrefix, readOnly }, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{pathPrefix}</TableCell>
                    <TableCell>{readOnly ? "Yes" : "No"}</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </>
        )}

        {this.renderRuleGroup("Fs Group", fsGroup)}
        {this.renderRuleGroup("Run As Group", runAsGroup)}
        {this.renderRuleGroup("Run As User", runAsUser)}
        {this.renderRuleGroup("Supplemental Groups", supplementalGroups)}

        {runtimeClass && (
          <>
            <DrawerTitle title="Runtime Class"/>
            <DrawerItem name="Allowed Runtime Class Names">
              {(runtimeClass.allowedRuntimeClassNames || []).join(", ") || "-"}
            </DrawerItem>
            <DrawerItem name="Default Runtime Class Name">
              {runtimeClass.defaultRuntimeClassName || "-"}
            </DrawerItem>
          </>
        )}

        {seLinux && (
          <>
            <DrawerTitle title="Se Linux"/>
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
