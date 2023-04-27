/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./vpa-details.scss";

import startCase from "lodash/startCase";
import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { cssNames } from "@k8slens/utilities";
import { ContainerScalingMode, ControlledValues, ResourceName, UpdateMode, VerticalPodAutoscaler } from "@k8slens/kube-object";
import type { PodUpdatePolicy, PodResourcePolicy, VerticalPodAutoscalerStatus } from "@k8slens/kube-object";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import loggerInjectable from "../../../common/logger.injectable";
import type { Logger } from "../../../common/logger";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";

export interface VpaDetailsProps extends KubeObjectDetailsProps<VerticalPodAutoscaler> {
}

interface Dependencies {
  apiManager: ApiManager;
  getDetailsUrl: GetDetailsUrl;
  logger: Logger;
}

@observer
class NonInjectedVpaDetails extends React.Component<VpaDetailsProps & Dependencies> {
  renderStatus(status: VerticalPodAutoscalerStatus) {
    const { recommendation } = status;
    const { object: vpa } = this.props;

    return (
      <div>
        <DrawerTitle>Status</DrawerTitle>
        <DrawerItem
          name="Status"
          className="status"
          labelsOnly
        >
          {vpa.getReadyConditions()
            .map(({ type, tooltip, isReady }) => (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            ))}
        </DrawerItem>

        {recommendation?.containerRecommendations && (
          recommendation.containerRecommendations
            .map( ({ containerName, target, lowerBound, upperBound, uncappedTarget }) => (
              <div key={containerName}>
                <DrawerTitle>{`Container Recommendation for ${containerName ?? "<unknown>"}`}</DrawerTitle>
                <DrawerItem name="target">
                  {Object.entries(target).map(([name, value]) => (
                    <DrawerItem key={name} name={startCase(name)}>
                      {value}
                    </DrawerItem>
                  ))}
                </DrawerItem>
                {lowerBound && (
                  <DrawerItem name="lowerBound">
                    {Object.entries(lowerBound).map(([name, value]) => (
                      <DrawerItem key={name} name={startCase(name)}>
                        {value}
                      </DrawerItem>
                    ))}
                  </DrawerItem>
                )}
                {upperBound && (
                  <DrawerItem name="upperBound">
                    {Object.entries(upperBound).map(([name, value]) => (
                      <DrawerItem key={name} name={startCase(name)}>
                        {value}
                      </DrawerItem>
                    ))}
                  </DrawerItem>
                )}
                {uncappedTarget && (
                  <DrawerItem name="uncappedTarget">
                    {Object.entries(uncappedTarget).map(([name, value]) => (
                      <DrawerItem key={name} name={startCase(name)}>
                        {value}
                      </DrawerItem>
                    ))}
                  </DrawerItem>
                )}
              </div>
            ))
        )}
      </div>
    );
  }

  renderUpdatePolicy(updatePolicy: PodUpdatePolicy) {
    return (
      <div>
        <DrawerTitle>Update Policy</DrawerTitle>
        <DrawerItem name="updateMode" >
          {updatePolicy?.updateMode ?? UpdateMode.UpdateModeAuto}
        </DrawerItem>
        <DrawerItem name="minReplicas" >
          {updatePolicy?.minReplicas}
        </DrawerItem>
      </div>
    );
  }

  renderResourcePolicy(resourcePolicy: PodResourcePolicy) {
    return (
      <div>
        {resourcePolicy.containerPolicies && (
          <div>
            {resourcePolicy.containerPolicies
              .map( ({ containerName, mode, minAllowed, maxAllowed, controlledResources, controlledValues }) => {
                return (
                  <div key={containerName}>
                    <DrawerTitle>{`Container Policy for ${containerName ?? "<unknown>"}`}</DrawerTitle>
                    <DrawerItem name="mode" >
                      {mode ?? ContainerScalingMode.ContainerScalingModeAuto}
                    </DrawerItem>
                    {minAllowed && (
                      <DrawerItem name="minAllowed" >
                        {Object.entries(minAllowed).map(([name, value]) => (
                          <DrawerItem key={name} name={startCase(name)}>
                            {value}
                          </DrawerItem>
                        ))}
                      </DrawerItem>
                    )}
                    {maxAllowed && (
                      <DrawerItem name="maxAllowed" >
                        {Object.entries(maxAllowed).map(([name, value]) => (
                          <DrawerItem key={name} name={startCase(name)}>
                            {value}
                          </DrawerItem>
                        ))}
                      </DrawerItem>
                    )}
                    <DrawerItem name="controlledResources" >
                      {controlledResources?.length ? controlledResources.join(", ") : `${ResourceName.ResourceCPU}, ${ResourceName.ResourceMemory}`}
                    </DrawerItem>
                    <DrawerItem name="controlledValues" >
                      {controlledValues ?? ControlledValues.ControlledValueRequestsAndLimits}
                    </DrawerItem>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    );
  }

  render() {
    const { object: vpa, apiManager, getDetailsUrl, logger } = this.props;

    if (!vpa) {
      return null;
    }

    if (!(vpa instanceof VerticalPodAutoscaler)) {
      logger.error("[VpaDetails]: passed object that is not an instanceof VerticalPodAutoscaler", vpa);

      return null;
    }

    const { targetRef, recommenders, resourcePolicy, updatePolicy } = vpa.spec;

    return (
      <div className="VpaDetails">
        <DrawerItem name="Reference">
          {targetRef && (
            <Link to={getDetailsUrl(apiManager.lookupApiLink(targetRef, vpa))}>
              {targetRef.kind}
              /
              {targetRef.name}
            </Link>
          )}
        </DrawerItem>

        <DrawerItem name="Recommender">
          {
            /* according to the spec there can be 0 or 1 recommenders, only */
            recommenders?.length ? recommenders[0].name : "default"
          }
        </DrawerItem>

        {vpa.status && this.renderStatus(vpa.status)}
        {updatePolicy && this.renderUpdatePolicy(updatePolicy)}
        {resourcePolicy && this.renderResourcePolicy(resourcePolicy)}

        <DrawerTitle>CRD details</DrawerTitle>
      </div>
    );
  }
}

export const VpaDetails = withInjectables<Dependencies, VpaDetailsProps>(NonInjectedVpaDetails, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
