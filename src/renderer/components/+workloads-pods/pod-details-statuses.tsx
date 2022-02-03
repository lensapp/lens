/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-statuses.scss";
import React from "react";
import countBy from "lodash/countBy";
import kebabCase from "lodash/kebabCase";
import type { Pod } from "../../../common/k8s-api/endpoints";

export interface PodDetailsStatusesProps {
  pods: Pod[];
}

export class PodDetailsStatuses extends React.Component<PodDetailsStatusesProps> {
  render() {
    const { pods } = this.props;

    if (!pods.length) return null;
    const statuses = countBy(pods.map(pod => pod.getStatus()));

    return (
      <div className="PodDetailsStatuses">
        {
          Object.keys(statuses).map(key => (
            <span key={key} className={kebabCase(key)}>
              {key}: {statuses[key]}
            </span>
          ))
        }
      </div>
    );
  }
}
