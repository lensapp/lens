/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-quota-details.scss";
import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cpuUnitsToNumber, cssNames, unitsToBytes, metricUnitsToNumber, object, hasDefinedTupleValue } from "../../utils";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceQuota } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { LineProgress } from "../line-progress";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

export interface ResourceQuotaDetailsProps extends KubeObjectDetailsProps<ResourceQuota> {
}

function transformUnit(name: string, value: string): number {
  if (name.includes("memory") || name.includes("storage")) {
    return unitsToBytes(value);
  }

  if (name.includes("cpu")) {
    return cpuUnitsToNumber(value);
  }

  return metricUnitsToNumber(value);
}

function renderQuotas(quota: ResourceQuota): JSX.Element[] {
  const { hard = {}, used = {}} = quota.status ?? {};

  return object.entries(hard)
    .filter(hasDefinedTupleValue)
    .map(([name, value]) => {
      const current = transformUnit(name, value);
      const max = transformUnit(name, value);
      const usage = max === 0 ? 100 : Math.ceil(current / max * 100); // special case 0 max as always 100% usage

      return (
        <div key={name} className={cssNames("param", kebabCase(name))}>
          <span className="title">{name}</span>
          <span className="value">
            {`${used[name]} / ${value}`}
          </span>
          <LineProgress
            max={max}
            value={current}
            tooltip={(
              <p>
                {`Set: ${value}. Usage: ${usage}%`}
              </p>
            )}
          />
        </div>
      );
    });
}

@observer
export class ResourceQuotaDetails extends React.Component<ResourceQuotaDetailsProps> {
  render() {
    const { object: quota } = this.props;

    if (!quota) {
      return null;
    }

    if (!(quota instanceof ResourceQuota)) {
      logger.error("[ResourceQuotaDetails]: passed object that is not an instanceof ResourceQuota", quota);

      return null;
    }

    return (
      <div className="ResourceQuotaDetails">
        <KubeObjectMeta object={quota}/>

        <DrawerItem name="Quotas" className="quota-list">
          {renderQuotas(quota)}
        </DrawerItem>

        {quota.getScopeSelector().length > 0 && (
          <>
            <DrawerTitle>Scope Selector</DrawerTitle>
            <Table className="paths">
              <TableHead>
                <TableCell>Operator</TableCell>
                <TableCell>Scope name</TableCell>
                <TableCell>Values</TableCell>
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
