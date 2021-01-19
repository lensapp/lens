import "./pod-details-statuses.scss";
import React from "react";
import countBy from "lodash/countBy";
import kebabCase from "lodash/kebabCase";
import { Pod } from "../../api/endpoints";

interface Props {
  pods: Pod[];
}

export class PodDetailsStatuses extends React.Component<Props> {
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