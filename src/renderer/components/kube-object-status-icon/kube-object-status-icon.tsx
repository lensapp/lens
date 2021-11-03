/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./kube-object-status-icon.scss";

import React from "react";
import { Icon } from "../icon";
import { cssNames, formatDuration } from "../../utils";
import { KubeObject, KubeObjectStatus, KubeObjectStatusLevel } from "../../..//extensions/renderer-api/k8s-api";
import { KubeObjectStatusRegistry } from "../../../extensions/registries";

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

function getAge(timestamp: string) {
  return timestamp
    ? formatDuration(Date.now() - new Date(timestamp).getTime(), true)
    : "";
}

interface SplitStatusesByLevel {
  maxLevel: string,
  criticals: KubeObjectStatus[];
  warnings: KubeObjectStatus[];
  infos: KubeObjectStatus[];
}

/**
 * This function returns the class level for corresponding to the highest status level
 * and the statuses split by their levels.
 * @param src a list of status items
 */
function splitByLevel(src: KubeObjectStatus[]): SplitStatusesByLevel {
  const parts = new Map(Object.values(KubeObjectStatusLevel).map(v => [v, []]));

  src.forEach(status => parts.get(status.level).push(status));

  const criticals = parts.get(KubeObjectStatusLevel.CRITICAL);
  const warnings = parts.get(KubeObjectStatusLevel.WARNING);
  const infos = parts.get(KubeObjectStatusLevel.INFO);
  const maxLevel = statusClassName(criticals[0]?.level ?? warnings[0]?.level ?? infos[0].level);

  return { maxLevel, criticals, warnings, infos };
}

interface Props {
  object: KubeObject;
}

export class KubeObjectStatusIcon extends React.Component<Props> {
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
              - {status.text} <span className="age"> · {getAge(status.timestamp)}</span>
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const statuses = KubeObjectStatusRegistry.getInstance().getItemsForObject(this.props.object);

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
