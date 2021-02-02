import { observer } from "mobx-react";
import React from "react";
import { remote } from "electron";

import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";
import { ConfirmDialog } from "../confirm-dialog";
import { clusterStore } from "../../../common/cluster-store";
import { clusterDisconnectHandler } from "../../../common/cluster-ipc";
import { broadcastMessage, requestMain } from "../../../common/ipc";
import { Cluster } from "../../../main/cluster";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface Props {
  cluster: Cluster
  className?: string
}

export const MainLayoutHeader = observer(({ cluster, className }: Props) => {
  const showContextMenu = () => {
    const { Menu, MenuItem } = remote;
    const menu = new Menu();

    menu.append(new MenuItem({
      label: "Settings",
      click: () => {
        broadcastMessage("renderer:navigate", clusterSettingsURL({
          params: {
            clusterId: cluster.id
          }
        }));
      }
    }));

    if (cluster.online) {
      menu.append(new MenuItem({
        label: "Disconnect",
        click: async () => {
          if (clusterStore.isActive(cluster.id)) {
            broadcastMessage("renderer:navigate", landingURL());
            clusterStore.setActive(null);
          }
          await requestMain(clusterDisconnectHandler, cluster.id);
        }
      }));

      if (!cluster.isManaged) {
        menu.append(new MenuItem({
          label: "Remove",
          click: () => {
            ConfirmDialog.open({
              okButtonProps: {
                primary: false,
                accent: true,
                label: "Remove"
              },
              ok: () => {
                if (clusterStore.activeClusterId === cluster.id) {
                  broadcastMessage("renderer:navigate", landingURL());
                  clusterStore.setActive(null);
                }
                clusterStore.removeById(cluster.id);
              },
              message: <p>Are you sure want to remove cluster <b title={cluster.id}>{cluster.contextName}</b>?</p>,
            });
          }
        }));
      }
    }
    menu.popup({
      window: remote.getCurrentWindow()
    });
  };

  return (
    <header className={cssNames("flex gaps align-center justify-space-between", className)}>
      <span className="cluster">{cluster.name}</span>
      <Icon
        material="more_vert"
        tooltip="Cluster actions"
        interactive
        onClick={showContextMenu}
      />
    </header>
  );
});
