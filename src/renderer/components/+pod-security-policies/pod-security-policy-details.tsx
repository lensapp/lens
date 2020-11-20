import "./pod-security-policy-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { KubeObjectDetailsProps } from "../kube-object";
import { PodSecurityPolicy } from "../../api/endpoints";
import { Badge } from "../badge";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

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
    if (!group) return;
    const { rule, ranges } = group;
    return (
      <>
        <DrawerTitle title={title}/>
        <DrawerItem name={<Trans>Rule</Trans>}>
          {rule}
        </DrawerItem>
        {ranges && (
          <DrawerItem name={<Trans>Ranges (Min-Max)</Trans>} labelsOnly>
            {ranges.map(({ min, max }, index) => {
              return <Badge key={index} label={`${min} - ${max}`}/>
            })}
          </DrawerItem>
        )}
      </>
    )
  }

  render() {
    const { object: psp } = this.props;
    if (!psp) {
      return null;
    }
    const {
      allowedHostPaths, allowedCapabilities, allowedCSIDrivers, allowedFlexVolumes, allowedProcMountTypes,
      allowedUnsafeSysctls, allowPrivilegeEscalation, defaultAddCapabilities, defaultAllowPrivilegeEscalation,
      forbiddenSysctls, fsGroup, hostIPC, hostNetwork, hostPID, hostPorts, privileged, readOnlyRootFilesystem,
      requiredDropCapabilities, runAsGroup, runAsUser, runtimeClass, seLinux, supplementalGroups, volumes
    } = psp.spec;
    return (
      <div className="PodSecurityPolicyDetails">
        <KubeObjectMeta object={psp}/>

        {allowedCapabilities && (
          <DrawerItem name={<Trans>Allowed Capabilities</Trans>}>
            {allowedCapabilities.join(", ")}
          </DrawerItem>
        )}

        {volumes && (
          <DrawerItem name={<Trans>Volumes</Trans>}>
            {volumes.join(", ")}
          </DrawerItem>
        )}

        {allowedCSIDrivers && (
          <DrawerItem name={<Trans>Allowed CSI Drivers</Trans>}>
            {allowedCSIDrivers.map(({ name }) => name).join(", ")}
          </DrawerItem>
        )}

        {allowedFlexVolumes && (
          <DrawerItem name={<Trans>Allowed Flex Volumes</Trans>}>
            {allowedFlexVolumes.map(({ driver }) => driver).join(", ")}
          </DrawerItem>
        )}

        {allowedProcMountTypes && (
          <DrawerItem name={<Trans>Allowed Proc Mount Types</Trans>}>
            {allowedProcMountTypes.join(", ")}
          </DrawerItem>
        )}

        {allowedUnsafeSysctls && (
          <DrawerItem name={<Trans>Allowed Unsafe Sysctls</Trans>}>
            {allowedUnsafeSysctls.join(", ")}
          </DrawerItem>
        )}

        {forbiddenSysctls && (
          <DrawerItem name={<Trans>Forbidden Sysctls</Trans>}>
            {forbiddenSysctls.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name={<Trans>Allow Privilege Escalation</Trans>}>
          {allowPrivilegeEscalation ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        <DrawerItem name={<Trans>Privileged</Trans>}>
          {privileged ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        <DrawerItem name={<Trans>Read-only Root Filesystem</Trans>}>
          {readOnlyRootFilesystem ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        {defaultAddCapabilities && (
          <DrawerItem name={<Trans>Default Add Capabilities</Trans>}>
            {defaultAddCapabilities.join(", ")}
          </DrawerItem>
        )}

        {requiredDropCapabilities && (
          <DrawerItem name={<Trans>Required Drop Capabilities</Trans>}>
            {requiredDropCapabilities.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name={<Trans>Host IPC</Trans>}>
          {hostIPC ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        <DrawerItem name={<Trans>Host Network</Trans>}>
          {hostNetwork ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        <DrawerItem name={<Trans>Host PID</Trans>}>
          {hostPID ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        {hostPorts && (
          <DrawerItem name={<Trans>Host Ports (Min-Max)</Trans>} labelsOnly>
            {hostPorts.map(({ min, max }, index) => {
              return <Badge key={index} label={`${min} - ${max}`}/>
            })}
          </DrawerItem>
        )}

        {allowedHostPaths && (
          <>
            <DrawerTitle title={<Trans>Allowed Host Paths</Trans>}/>
            <Table>
              <TableHead>
                <TableCell><Trans>Path Prefix</Trans></TableCell>
                <TableCell><Trans>Read-only</Trans></TableCell>
              </TableHead>
              {allowedHostPaths.map(({ pathPrefix, readOnly }, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{pathPrefix}</TableCell>
                    <TableCell>{readOnly ? <Trans>Yes</Trans> : <Trans>No</Trans>}</TableCell>
                  </TableRow>
                )
              })}
            </Table>
          </>
        )}

        {this.renderRuleGroup(<Trans>Fs Group</Trans>, fsGroup)}
        {this.renderRuleGroup(<Trans>Run As Group</Trans>, runAsGroup)}
        {this.renderRuleGroup(<Trans>Run As User</Trans>, runAsUser)}
        {this.renderRuleGroup(<Trans>Supplemental Groups</Trans>, supplementalGroups)}

        {runtimeClass && (
          <>
            <DrawerTitle title={<Trans>Runtime Class</Trans>}/>
            <DrawerItem name={<Trans>Allowed Runtime Class Names</Trans>}>
              {(runtimeClass.allowedRuntimeClassNames || []).join(", ") || "-"}
            </DrawerItem>
            <DrawerItem name={<Trans>Default Runtime Class Name</Trans>}>
              {runtimeClass.defaultRuntimeClassName || "-"}
            </DrawerItem>
          </>
        )}

        {seLinux && (
          <>
            <DrawerTitle title={<Trans>Se Linux</Trans>}/>
            <DrawerItem name={<Trans>Rule</Trans>}>
              {seLinux.rule}
            </DrawerItem>
            {seLinux.seLinuxOptions && (
              <>
                <DrawerItem name={<Trans>Level</Trans>}>
                  {seLinux.seLinuxOptions.level}
                </DrawerItem>
                <DrawerItem name={<Trans>Role</Trans>}>
                  {seLinux.seLinuxOptions.role}
                </DrawerItem>
                <DrawerItem name={<Trans>Type</Trans>}>
                  {seLinux.seLinuxOptions.type}
                </DrawerItem>
                <DrawerItem name={<Trans>User</Trans>}>
                  {seLinux.seLinuxOptions.user}
                </DrawerItem>
              </>
            )}
          </>
        )}

      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "PodSecurityPolicy",
  apiVersions: ["policy/v1beta1"],
  components: {
    Details: (props) => <PodSecurityPolicyDetails {...props}/>
  }
})
