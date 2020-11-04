import "./kube-resource-status-icon.scss";

import React from "react";
import { Icon } from "../icon";
import { KubeObject } from "../../api/kube-object";
import { cssNames, formatDuration } from "../../utils";
import { ResourceStatusRegistration, ResourceStatus, ResourceStatusLevel, resourceStatusRegistry } from "../../../extensions/registries/resource-status-registry"
import { computed } from "mobx";

interface Props {
  object: KubeObject;
}

export class KubeResourceStatusIcon extends React.Component<Props> {
  @computed get resourceStatuses() {
    const { object } = this.props;
    const registrations = resourceStatusRegistry.getItemsForKind(object.kind, object.apiVersion)
    return registrations.map((item: ResourceStatusRegistration) => { return item.resolve(object) }).filter((item: ResourceStatus) => !!item)
  }

  resourceStatusClassName(level: number): string {
    switch (level) {
      case ResourceStatusLevel.INFO:
        return "info"
      case ResourceStatusLevel.WARNING:
        return "warning"
      case ResourceStatusLevel.CRITICAL:
        return "error"
      default:
        return "";
    }
  }

  resourceStatusTitle(level: number): string {
    switch (level) {
      case ResourceStatusLevel.INFO:
        return "Info"
      case ResourceStatusLevel.WARNING:
        return "Warning"
      case ResourceStatusLevel.CRITICAL:
        return "Critical"
      default:
        return "";
    }
  }

  getAge(timestamp: string) {
    if (!timestamp) return ""
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    return formatDuration(diff, true);
  }

  renderStatuses(statuses: ResourceStatus[], level: number) {
    const filteredStatuses = statuses.filter((item) => item.level == level)

    return filteredStatuses.length > 0 && (
      <div className={cssNames("ResourceStatusLevel", this.resourceStatusClassName(level))}>
        <span className="ResourceStatusTitle">
          {this.resourceStatusTitle(level)}
        </span>
        { filteredStatuses.map((status, index) =>{
          return (
            <div key={`kube-resource-status-${level}-${index}`} className={cssNames("status", "msg")}>
              - {status.text} <span className="age"> · { this.getAge(status.timestamp) }</span>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const { resourceStatuses} = this
    if (!resourceStatuses.length) return null

    const sortedStatuses = resourceStatuses.sort((a: ResourceStatus, b: ResourceStatus) => {
      if (a.level < b.level ) {
        return 1
      }
      if (a.level > b.level ) {
        return -1
      }
      return 0
    })

    const level = this.resourceStatusClassName(sortedStatuses[0].level)
    return (
      <Icon
        material={level}
        className={cssNames("ResourceStatusIcon", level)}
        tooltip={{
          children: (
            <div className="ResourceStatusTooltip">
              {this.renderStatuses(sortedStatuses, ResourceStatusLevel.CRITICAL)}
              {this.renderStatuses(sortedStatuses, ResourceStatusLevel.WARNING)}
              {this.renderStatuses(sortedStatuses, ResourceStatusLevel.INFO)}
            </div>
          )
        }}
      />
    )
  }
}
