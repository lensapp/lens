import React from "react";
import { observer } from "mobx-react";

import { ClusterActions } from "../cluster-manager";
import { Cluster } from "../../../main/cluster";
import { cssNames } from "../../utils";
import { MenuActions, MenuItem } from "../menu";

interface Props {
  cluster: Cluster
  className?: string
}

export const MainLayoutHeader = observer(({ cluster, className }: Props) => {
  const actions = ClusterActions(cluster);
  const renderMenu = () => <MenuActions className="ClusterActionsMenu">
    <MenuItem onClick={actions.SHOW_SETTINGS}>
      <span>Settings</span>
    </MenuItem>
    <MenuItem onClick={actions.DISCONNECT}>
      <span>Disconnect</span>
    </MenuItem>
    { !cluster.isManaged && <MenuItem onClick={actions.REMOVE}>
      <span>Remove</span>
    </MenuItem> }
  </MenuActions>;

  return (
    <header className={cssNames("flex gaps align-center justify-space-between", className)}>
      <span className="cluster">{cluster.name}</span>
      {renderMenu()}
    </header>
  );
});
