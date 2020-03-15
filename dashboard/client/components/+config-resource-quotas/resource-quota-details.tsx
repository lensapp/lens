import "./resource-quota-details.scss";
import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cpuUnitsToNumber, cssNames, unitsToBytes } from "../../utils";
import { KubeObjectDetailsProps } from "../kube-object";
import { ResourceQuota, resourceQuotaApi } from "../../api/endpoints/resource-quota.api";
import { LineProgress } from "../line-progress";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<ResourceQuota> {
}

@observer
export class ResourceQuotaDetails extends React.Component<Props> {
  renderQuotas = (quota: ResourceQuota) => {
    const { hard, used } = quota.status
    if (!hard || !used) return null
    const transformUnit = (name: string, value: string) => {
      if (name.includes("memory") || name.includes("storage")) {
        return unitsToBytes(value)
      }
      if (name.includes("cpu")) {
        return cpuUnitsToNumber(value)
      }
      return parseInt(value)
    }
    return Object.entries(hard).map(([name, value]) => {
      if (!used[name]) return null
      const current = transformUnit(name, used[name])
      const max = transformUnit(name, value)
      return (
        <div key={name} className={cssNames("param", kebabCase(name))}>
          <span className="title">{name}</span>
          <span className="value">{used[name]} / {value}</span>
          <LineProgress
            max={max}
            value={current}
            tooltip={
              <p><Trans>Set</Trans>: {value}. <Trans>Used</Trans>: {Math.ceil(current / max * 100) + "%"}</p>
            }
          />
        </div>
      )
    })
  }

  render() {
    const { object: quota } = this.props;
    if (!quota) return null;
    return (
      <div className="ResourceQuotaDetails">
        <KubeObjectMeta object={quota}/>

        <DrawerItem name={<Trans>Quotas</Trans>} className="quota-list">
          {this.renderQuotas(quota)}
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

apiManager.registerViews(resourceQuotaApi, {
  Details: ResourceQuotaDetails
})