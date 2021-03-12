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
import GraphemeSplitter from "grapheme-splitter";

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

function getNameParts(name: string): string[] {
  const byWhitespace = name.split(/\s+/);

  if (byWhitespace.length > 1) {
    return byWhitespace;
  }

  const byDashes = name.split(/[-_]+/);

  if (byDashes.length > 1) {
    return byDashes;
  }

  return name.split(/@+/);
}

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
    const [rawfirst, rawSecond] = getNameParts(this.props.cluster.name);
    const splitter = new GraphemeSplitter();
    const first = splitter.iterateGraphemes(rawfirst);
    const second = rawSecond ? splitter.iterateGraphemes(rawSecond) : first;
    let res = "";

    for (const grapheme of first) {
      res += grapheme;
      break;
    }

    for (const grapheme of second) {
      res += grapheme;
      break;
    }

    return res;
  }

  renderIcon() {
    const { cluster } = this.props;
    const { name, iconPreference } = cluster;

    if (typeof iconPreference === "string") {
      return <img src={iconPreference} alt={name} />;
    }

    return (
      <Avatar variant="rounded" style={{backgroundColor: iconPreference.background}}>
        {this.iconString}
      </Avatar>
    );
  }

  render() {
    const {
      cluster, showErrors, showTooltip, errorClass, interactive, isActive,
      children, className, ...elemProps
    } = this.props;
    const { name, id: clusterId, online } = cluster;
    const eventCount = this.eventCount;
    const clusterIconId = `cluster-icon-${clusterId}`;
    const classNames = cssNames("ClusterIcon flex inline", className, {
      interactive: interactive ?? Boolean(this.props.onClick),
      active: isActive,
    });

    return (
      <div {...elemProps} className={classNames} id={showTooltip ? clusterIconId : null}>
        {showTooltip && (
          <Tooltip targetId={clusterIconId}>{name}</Tooltip>
        )}
        {this.renderIcon()}
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
