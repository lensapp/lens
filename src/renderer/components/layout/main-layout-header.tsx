import React from "react";
import { Trans } from "@lingui/macro";

import { clusterSettingsURL } from "../+cluster-settings";
import { broadcastMessage } from "../../../common/ipc";
import { Cluster } from "../../../main/cluster";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface Props {
  cluster: Cluster
  className?: string
}

export function MainLayoutHeader({ cluster, className }: Props) {
  return (
    <header className={cssNames("flex gaps align-center justify-space-between", className)}>
      <span className="cluster">{cluster.name}</span>
      <Icon
        material="settings"
        tooltip={<Trans>Open cluster settings</Trans>}
        interactive
        onClick={() => {
          broadcastMessage("renderer:navigate", clusterSettingsURL({
            params: {
              clusterId: cluster.id
            }
          }));
        }}
      />
    </header>
  );
}