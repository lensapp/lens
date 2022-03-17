/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-status-icon.scss";

import React from "react";
import { Icon } from "../icon";
import { cssNames, formatDuration, getOrInsert } from "../../utils";
import type { KubeObject, KubeObjectStatus } from "../../..//extensions/renderer-api/k8s-api";
import { KubeObjectStatusLevel } from "../../..//extensions/renderer-api/k8s-api";
import { withInjectables } from "@ogre-tools/injectable-react";
import statusesForKubeObjectInjectable from "./statuses-for-kube-object.injectable";

function statusClassName(level: KubeObjectStatusLevel): string {
  switch (level) {
    case KubeObjectStatusLevel.INFO:
      return "info";
    case KubeObjectStatusLevel.WARNING:
      return "warning";
    case KubeObjectStatusLevel.CRITICAL:
      return "error";
  }
}

function statusTitle(level: KubeObjectStatusLevel): string {
  switch (level) {
    case KubeObjectStatusLevel.INFO:
      return "Info";
    case KubeObjectStatusLevel.WARNING:
      return "Warning";
    case KubeObjectStatusLevel.CRITICAL:
      return "Critical";
  }
}

function getAge(timestamp: string | undefined) {
  return timestamp
    ? formatDuration(Date.now() - new Date(timestamp).getTime(), true)
    : "";
}

interface SplitStatusesByLevel {
  maxLevel: string;
  criticals: KubeObjectStatus[];
  warnings: KubeObjectStatus[];
  infos: KubeObjectStatus[];
}

/**
 * This function returns the class level for corresponding to the highest status level
 * and the statuses split by their levels.
 * @param statuses a list of status items
 */
function splitByLevel(statuses: KubeObjectStatus[]): SplitStatusesByLevel {
  const parts = new Map<KubeObjectStatusLevel, KubeObjectStatus[]>();

  for (const status of statuses) {
    const part = getOrInsert(parts, status.level, []);

    part.push(status);
  }

  const criticals = parts.get(KubeObjectStatusLevel.CRITICAL) ?? [];
  const warnings = parts.get(KubeObjectStatusLevel.WARNING) ?? [];
  const infos = parts.get(KubeObjectStatusLevel.INFO) ?? [];
  const maxLevel = statusClassName(criticals[0]?.level ?? warnings[0]?.level ?? infos[0].level);

  return { maxLevel, criticals, warnings, infos };
}

export interface KubeObjectStatusIconProps {
  object: KubeObject;
}

interface Dependencies {
  statuses: KubeObjectStatus[];
}

class NonInjectedKubeObjectStatusIcon extends React.Component<KubeObjectStatusIconProps & Dependencies> {
  renderStatuses(statuses: KubeObjectStatus[], level: number) {
    const filteredStatuses = statuses.filter((item) => item.level == level);

    return filteredStatuses.length > 0 && (
      <div className={cssNames("level", statusClassName(level))}>
        <span className="title">
          {statusTitle(level)}
        </span>
        {
          filteredStatuses.map((status, index) => (
            <div key={`kube-resource-status-${level}-${index}`} className={cssNames("status", "msg")}>
              {`- ${status.text} `}
              <span className="age">
                {" . "}
                {getAge(status.timestamp)}
              </span>
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const statuses = this.props.statuses;

    if (statuses.length === 0) {
      return null;
    }

    const { maxLevel, criticals, warnings, infos } = splitByLevel(statuses);

    return (
      <Icon
        material={maxLevel}
        className={cssNames("KubeObjectStatusIcon", maxLevel)}
        tooltip={{
          children: (
            <div className="KubeObjectStatusTooltip">
              {this.renderStatuses(criticals, KubeObjectStatusLevel.CRITICAL)}
              {this.renderStatuses(warnings, KubeObjectStatusLevel.WARNING)}
              {this.renderStatuses(infos, KubeObjectStatusLevel.INFO)}
            </div>
          ),
        }}
      />
    );
  }
}

export const KubeObjectStatusIcon = withInjectables<Dependencies, KubeObjectStatusIconProps>(
  NonInjectedKubeObjectStatusIcon,

  {
    getProps: (di, props) => ({
      statuses: di.inject(statusesForKubeObjectInjectable, props.object),
      ...props,
    }),
  },
);
