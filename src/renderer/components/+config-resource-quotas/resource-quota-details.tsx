import "./resource-quota-details.scss";
import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cpuUnitsToNumber, cssNames, unitsToBytes, metricUnitsToNumber } from "../../utils";
import { KubeObjectDetailsProps } from "../kube-object";
import { ResourceQuota } from "../../api/endpoints/resource-quota.api";
import { LineProgress } from "../line-progress";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { ReplicaSetDetails } from "../+workloads-replicasets";

interface Props extends KubeObjectDetailsProps<ResourceQuota> {
}

const onlyNumbers = /$[0-9]*^/g;

function transformUnit(name: string, value: string): number {
  if (name.includes("memory") || name.includes("storage")) {
    return unitsToBytes(value)
  }

  if (name.includes("cpu")) {
    return cpuUnitsToNumber(value)
  }

  return metricUnitsToNumber(value);
}

function renderQuotas(quota: ResourceQuota): JSX.Element[] {
  const { hard = {}, used = {} } = quota.status

  return Object.entries(hard)
    .filter(([name]) => used[name])
    .map(([name, value]) => {
      const current = transformUnit(name, used[name])
      const max = transformUnit(name, value)
      const usage = max === 0 ? 100 : Math.ceil(current / max * 100); // special case 0 max as always 100% usage

      return (
        <div key={name} className={cssNames("param", kebabCase(name))}>
          <span className="title">{name}</span>
          <span className="value">{used[name]} / {value}</span>
          <LineProgress
            max={max}
            value={current}
            tooltip={
              <p><Trans>Set</Trans>: {value}. <Trans>Usage</Trans>: {usage + "%"}</p>
            }
          />
        </div>
      )
    })
}

@observer
export class ResourceQuotaDetails extends React.Component<Props> {
  render() {
    const { object: quota } = this.props;
    if (!quota) return null;
    return (
      <div className="ResourceQuotaDetails">
        <KubeObjectMeta object={quota}/>

        <DrawerItem name={<Trans>Quotas</Trans>} className="quota-list">
          {renderQuotas(quota)}
        </DrawerItem>

        {quota.getScopeSelector().length > 0 && (
          <>
            <DrawerTitle title={<Trans>Scope Selector</Trans>}/>
            <Table className="paths">
              <TableHead>
                <TableCell><Trans>Operator</Trans></TableCell>
                <TableCell><Trans>Scope name</Trans></TableCell>
                <TableCell><Trans>Values</Trans></TableCell>
              </TableHead>
              {
                quota.getScopeSelector().map((selector, index) => {
                  const { operator, scopeName, values } = selector;
                  return (
                    <TableRow key={index}>
                      <TableCell>{operator}</TableCell>
                      <TableCell>{scopeName}</TableCell>
                      <TableCell>{values.join(", ")}</TableCell>
                    </TableRow>
                  );
                })
              }
            </Table>
          </>
        )}
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "ResourceQuota",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <ReplicaSetDetails {...props} />
  }
})
