import React from "react";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon";

export function NoMetrics() {
  return (
    <div className="flex justify-center align-center">
      <Icon material="info"/>&nbsp;<Trans>Metrics not available at the moment</Trans>
    </div>
  );
}