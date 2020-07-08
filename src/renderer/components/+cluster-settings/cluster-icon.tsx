import "./cluster-icon.scss"

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { Hashicon, HashiconProps } from "@emeraldpay/hashicon-react";
import { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";

interface Props extends DOMAttributes<HTMLElement>, Omit<HashiconProps, "value"> {
  className?: IClassName;
  showBadge?: boolean;
  cluster: Cluster;
}

const defaultProps: Partial<Props> = {
  size: 38,
  showBadge: true,
};

@observer
export class ClusterIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const { className, cluster, showBadge, options, size, ...elemProps } = this.props;
    const { isAdmin, eventCount, preferences } = cluster;
    const { clusterName, icon } = preferences;
    const eventsCount = eventCount >= 1000 ? Math.ceil(eventCount / 1000) * 1000 + "+" : eventCount;
    return (
      <div className={cssNames("ClusterIcon flex inline", className)} {...elemProps}>
        {icon && <img src={icon} width={size} height={size} alt={clusterName}/>}
        {!icon && (
          <Hashicon
            value={clusterName}
            size={size}
            options={options}
          />
        )}
        {showBadge && isAdmin && eventsCount && (
          <Badge label={eventsCount} className="events-count"/>
        )}
      </div>
    );
  }
}
