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

import "./limit-range-details.scss";

import React from "react";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { LimitPart, LimitRange, LimitRangeItem, Resource } from "../../api/endpoints/limit-range.api";
import { KubeObjectMeta } from "../kube-object-meta";
import { DrawerItem } from "../drawer/drawer-item";
import { Badge } from "../badge";

interface Props extends KubeObjectDetailsProps<LimitRange> {
}

function renderLimit(limit: LimitRangeItem, part: LimitPart, resource: Resource) {

  const resourceLimit = limit[part]?.[resource];

  if (!resourceLimit) {
    return null;
  }

  return <Badge label={`${part}:${resourceLimit}`}/>;
}

function renderResourceLimits(limit: LimitRangeItem, resource: Resource) {
  return (
    <React.Fragment key={limit.type + resource}>
      {renderLimit(limit, LimitPart.MIN, resource)}
      {renderLimit(limit, LimitPart.MAX, resource)}
      {renderLimit(limit, LimitPart.DEFAULT, resource)}
      {renderLimit(limit, LimitPart.DEFAULT_REQUEST, resource)}
      {renderLimit(limit, LimitPart.MAX_LIMIT_REQUEST_RATIO, resource)}
    </React.Fragment>
  );
}

function renderLimitDetails(limits: LimitRangeItem[], resources: Resource[]) {

  return resources.map(resource =>
    <DrawerItem key={resource} name={resource}>
      {
        limits.map(limit =>
          renderResourceLimits(limit, resource)
        )
      }
    </DrawerItem>
  );
}

@observer
export class LimitRangeDetails extends React.Component<Props> {
  render() {
    const { object: limitRange } = this.props;

    if (!limitRange) return null;
    const containerLimits = limitRange.getContainerLimits();
    const podLimits = limitRange.getPodLimits();
    const pvcLimits = limitRange.getPVCLimits();

    return (
      <div className="LimitRangeDetails">
        <KubeObjectMeta object={limitRange}/>

        {containerLimits.length > 0 &&
        <DrawerItem name="Container Limits" labelsOnly>
          {
            renderLimitDetails(containerLimits, [Resource.CPU, Resource.MEMORY, Resource.EPHEMERAL_STORAGE])
          }
        </DrawerItem>
        }
        {podLimits.length > 0 &&
        <DrawerItem name="Pod Limits" labelsOnly>
          {
            renderLimitDetails(podLimits, [Resource.CPU, Resource.MEMORY, Resource.EPHEMERAL_STORAGE])
          }
        </DrawerItem>
        }
        {pvcLimits.length > 0 &&
        <DrawerItem name="Persistent Volume Claim Limits" labelsOnly>
          {
            renderLimitDetails(pvcLimits, [Resource.STORAGE])
          }
        </DrawerItem>
        }
      </div>
    );
  }
}
