import "./limit-range-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { LimitPart, LimitRange, LimitRangeItem, Resource } from "../../api/endpoints/limit-range.api";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
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

kubeObjectDetailRegistry.add({
  kind: "LimitRange",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <LimitRangeDetails {...props} />
  }
});
