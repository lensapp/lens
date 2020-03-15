import React from "react";
import { Icon } from "../icon";
import { Trans } from "@lingui/macro";
import { cssNames } from "../../utils";

interface Props {
  className: string;
}

export function ClusterNoMetrics({ className }: Props) {
  return (
    <div className={cssNames("ClusterNoMetrics flex column box grow justify-center align-center", className)}>
      <Icon material="info"/>
      <p><Trans>Metrics are not available due to missing or invalid Prometheus configuration.</Trans></p>
      <p><Trans>Right click cluster icon to open cluster settings.</Trans></p>
    </div>
  );
}
