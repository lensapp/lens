import "./kube-object-status-icon.scss";

import React from "react";
import { Icon } from "../icon";
import { KubeObject } from "../../api/kube-object";
import { cssNames, formatDuration } from "../../utils";
import { KubeObjectStatusRegistration, kubeObjectStatusRegistry } from "../../../extensions/registries/kube-object-status-registry";
import { KubeObjectStatus, KubeObjectStatusLevel } from "../../..//extensions/renderer-api/k8s-api";
import { computed } from "mobx";

interface Props {
  object: KubeObject;
}

export class KubeObjectStatusIcon extends React.Component<Props> {
  @computed get objectStatuses() {
    const { object } = this.props;
    const registrations = kubeObjectStatusRegistry.getItemsForKind(object.kind, object.apiVersion);
    return registrations.map((item: KubeObjectStatusRegistration) => { return item.resolve(object); }).filter((item: KubeObjectStatus) => !!item);
  }

  statusClassName(level: number): string {
    switch (level) {
    case KubeObjectStatusLevel.INFO:
      return "info";
    case KubeObjectStatusLevel.WARNING:
      return "warning";
    case KubeObjectStatusLevel.CRITICAL:
      return "error";
    default:
      return "";
    }
  }

  statusTitle(level: number): string {
    switch (level) {
    case KubeObjectStatusLevel.INFO:
      return "Info";
    case KubeObjectStatusLevel.WARNING:
      return "Warning";
    case KubeObjectStatusLevel.CRITICAL:
      return "Critical";
    default:
      return "";
    }
  }

  getAge(timestamp: string) {
    if (!timestamp) return "";
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    return formatDuration(diff, true);
  }

  renderStatuses(statuses: KubeObjectStatus[], level: number) {
    const filteredStatuses = statuses.filter((item) => item.level == level);

    return filteredStatuses.length > 0 && (
      <div className={cssNames("level", this.statusClassName(level))}>
        <span className="title">
          {this.statusTitle(level)}
        </span>
        { filteredStatuses.map((status, index) =>{
          return (
            <div key={`kube-resource-status-${level}-${index}`} className={cssNames("status", "msg")}>
              - {status.text} <span className="age"> · { this.getAge(status.timestamp) }</span>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { objectStatuses} = this;
    if (!objectStatuses.length) return null;

    const sortedStatuses = objectStatuses.sort((a: KubeObjectStatus, b: KubeObjectStatus) => {
      if (a.level < b.level ) {
        return 1;
      }
      if (a.level > b.level ) {
        return -1;
      }
      return 0;
    });

    const level = this.statusClassName(sortedStatuses[0].level);
    return (
      <Icon
        material={level}
        className={cssNames("KubeObjectStatusIcon", level)}
        tooltip={{
          children: (
            <div className="KubeObjectStatusTooltip">
              {this.renderStatuses(sortedStatuses, KubeObjectStatusLevel.CRITICAL)}
              {this.renderStatuses(sortedStatuses, KubeObjectStatusLevel.WARNING)}
              {this.renderStatuses(sortedStatuses, KubeObjectStatusLevel.INFO)}
            </div>
          )
        }}
      />
    );
  }
}
