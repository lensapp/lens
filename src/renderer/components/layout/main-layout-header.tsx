import React, { useState } from "react";
import { observer } from "mobx-react";
import { uniqueId } from "lodash";

import { ClusterActions } from "../cluster-manager";
import { Cluster } from "../../../main/cluster";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";

interface Props {
  cluster: Cluster
  className?: string
}

export const MainLayoutHeader = observer(({ cluster, className }: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const id = uniqueId("cluster_actions_");
  const actions = ClusterActions(cluster);

  const renderMenu = () => <Menu
    usePortal
    isOpen={isMenuOpen}
    open={() => setMenuOpen(true)}
    close={() => setMenuOpen(false)}
    className="ClusterActionsMenu"
    htmlFor={id}
    toggleEvent="click">
    <MenuItem onClick={actions.SHOW_SETTINGS}>
      <span>Settings</span>
    </MenuItem>
    <MenuItem onClick={actions.DISCONNECT}>
      <span>Disconnect</span>
    </MenuItem>
    { !cluster.isManaged && <MenuItem onClick={actions.REMOVE}>
      <span>Remove</span>
    </MenuItem> }
  </Menu>;

  return (
    <header className={cssNames("flex gaps align-center justify-space-between", className)}>
      <span className="cluster">{cluster.name}</span>
      <Icon
        id={id}
        material="more_vert"
        interactive
      />
      {renderMenu()}
    </header>
  );
});
