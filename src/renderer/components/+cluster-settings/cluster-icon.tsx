import "./cluster-icon.scss"

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { Hashicon, HashiconProps } from "@emeraldpay/hashicon-react";
import { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";

interface Props extends DOMAttributes<HTMLElement> {
  cluster: Cluster;
  className?: IClassName;
  errorClass?: IClassName;
  showErrorCount?: boolean;
  options?: HashiconProps["options"]
}

const defaultProps: Partial<Props> = {
  showErrorCount: true,
};

@observer
export class ClusterIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const { className, cluster, showErrorCount, errorClass, options, children, ...elemProps } = this.props;
    const { isAdmin, eventCount, preferences } = cluster;
    const { clusterName, icon } = preferences;
    return (
      <div className={cssNames("ClusterIcon flex inline", className)} {...elemProps}>
        {icon && <img src={icon} alt={clusterName}/>}
        {!icon && <Hashicon value={clusterName} options={options}/>}
        {showErrorCount && isAdmin && eventCount > 0 && (
          <Badge
            className={cssNames("events-count", errorClass)}
            label={eventCount >= 1000 ? Math.ceil(eventCount / 1000) * 1000 + "+" : eventCount}
          />
        )}
        {children}
      </div>
    );
  }
}
