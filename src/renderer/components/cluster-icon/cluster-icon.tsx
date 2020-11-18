import "./cluster-icon.scss"

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { Params as HashiconParams } from "@emeraldpay/hashicon";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { Tooltip } from "../tooltip";

interface Props extends DOMAttributes<HTMLElement> {
  cluster: Cluster;
  className?: IClassName;
  errorClass?: IClassName;
  showErrors?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
  isActive?: boolean;
  options?: HashiconParams;
}

const defaultProps: Partial<Props> = {
  showErrors: true,
  showTooltip: true,
};

@observer
export class ClusterIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const {
      cluster, showErrors, showTooltip, errorClass, options, interactive, isActive,
      children, ...elemProps
    } = this.props;
    const { isAdmin, name, eventCount, preferences, id: clusterId } = cluster;
    const { icon } = preferences;
    const clusterIconId = `cluster-icon-${clusterId}`;
    const className = cssNames("ClusterIcon flex inline", this.props.className, {
      interactive: interactive !== undefined ? interactive : !!this.props.onClick,
      active: isActive,
    });
    return (
      <div {...elemProps} className={className} id={showTooltip ? clusterIconId : null}>
        {showTooltip && (
          <Tooltip targetId={clusterIconId}>{name}</Tooltip>
        )}
        {icon && <img src={icon} alt={name}/>}
        {!icon && <Hashicon value={clusterId} options={options}/>}
        {showErrors && isAdmin && eventCount > 0 && (
          <Badge
            className={cssNames("events-count", errorClass)}
            label={eventCount >= 1000 ? Math.ceil(eventCount / 1000) + "k+" : eventCount}
          />
        )}
        {children}
      </div>
    );
  }
}
