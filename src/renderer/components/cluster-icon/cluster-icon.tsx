import "./cluster-icon.scss";

import React, { DOMAttributes } from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { Tooltip } from "../tooltip";
import { subscribeToBroadcast } from "../../../common/ipc";
import { observable } from "mobx";
import { Avatar } from "@material-ui/core";

interface Props extends DOMAttributes<HTMLElement> {
  cluster: Cluster;
  className?: IClassName;
  errorClass?: IClassName;
  showErrors?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
  isActive?: boolean;
}

const defaultProps: Partial<Props> = {
  showErrors: true,
  showTooltip: true,
};

@observer
export class ClusterIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  @observable eventCount = 0;

  get eventCountBroadcast() {
    return `cluster-warning-event-count:${this.props.cluster.id}`;
  }

  componentDidMount() {
    const subscriber = subscribeToBroadcast(this.eventCountBroadcast, (ev, eventCount) => {
      this.eventCount = eventCount;
    });

    disposeOnUnmount(this, [
      subscriber
    ]);
  }

  get iconString() {
    let splittedName = this.props.cluster.name.split(" ");

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("-");
    }

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("@");
    }

    splittedName = splittedName.map((part) => part.replace(/\W/g, ""));

    if (splittedName.length === 1) {
      return splittedName[0].substring(0, 2);
    } else {
      return splittedName[0].substring(0, 1) + splittedName[1].substring(0, 1);
    }
  }

  render() {
    const {
      cluster, showErrors, showTooltip, errorClass, interactive, isActive,
      children, ...elemProps
    } = this.props;
    const { name, preferences, id: clusterId, online } = cluster;
    const eventCount = this.eventCount;
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
        {!icon && <Avatar variant="square" className={isActive ? "active" : "default"}>{this.iconString}</Avatar>}
        {showErrors && eventCount > 0 && !isActive && online && (
          <Badge
            className={cssNames("events-count", errorClass)}
            label={eventCount >= 1000 ? `${Math.ceil(eventCount / 1000)}k+` : eventCount}
          />
        )}
        {children}
      </div>
    );
  }
}
