/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import styles from "./command-container.module.scss";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { CommandDialog } from "./command-dialog";
import type { ClusterId } from "../../../common/cluster-types";
import type { CommandOverlay } from "./command-overlay.injectable";
import commandOverlayInjectable from "./command-overlay.injectable";
import type { ipcRendererOn } from "../../../common/ipc";
import { broadcastMessage } from "../../../common/ipc";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { AddWindowEventListener } from "../../window/event-listener.injectable";
import windowAddEventListenerInjectable from "../../window/event-listener.injectable";
import type { IComputedValue } from "mobx";
import matchedClusterIdInjectable from "../../navigation/matched-cluster-id.injectable";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import legacyOnChannelListenInjectable from "../../ipc/legacy-channel-listen.injectable";
import { onKeyboardShortcut } from "@k8slens/utilities";

interface Dependencies {
  addWindowEventListener: AddWindowEventListener;
  commandOverlay: CommandOverlay;
  clusterId: ClusterId | undefined;
  matchedClusterId: IComputedValue<ClusterId | undefined>;
  isMac: boolean;
  legacyOnChannelListen: typeof ipcRendererOn;
}

@observer
class NonInjectedCommandContainer extends React.Component<Dependencies> {
  componentDidMount() {
    const { clusterId, addWindowEventListener, commandOverlay, matchedClusterId, isMac } = this.props;

    const action = clusterId
      ? () => commandOverlay.open(<CommandDialog />)
      : () => {
        const matchedId = matchedClusterId.get();

        if (matchedId) {
          broadcastMessage(`command-palette:${matchedClusterId}:open`);
        } else {
          commandOverlay.open(<CommandDialog />);
        }
      };
    const ipcChannel = clusterId
      ? `command-palette:${clusterId}:open`
      : "command-palette:open";

    disposeOnUnmount(this, [
      this.props.legacyOnChannelListen(ipcChannel, action),
      addWindowEventListener("keydown", onKeyboardShortcut(
        isMac
          ? "Shift+Cmd+P"
          : "Shift+Ctrl+P",
        action,
      )),
      addWindowEventListener("keydown", (event) => {
        if (event.code === "Escape") {
          event.stopPropagation();
          this.props.commandOverlay.close();
        }
      }),
    ]);
  }

  render() {
    const { commandOverlay } = this.props;

    return (
      <Dialog
        isOpen={commandOverlay.isOpen}
        animated={false}
        onClose={commandOverlay.close}
        modal={false}
      >
        <div className={styles.CommandContainer} data-testid="command-container">
          {commandOverlay.component}
        </div>
      </Dialog>
    );
  }
}

export const CommandContainer = withInjectables<Dependencies>(NonInjectedCommandContainer, {
  getProps: (di, props) => ({
    ...props,
    clusterId: di.inject(hostedClusterIdInjectable),
    addWindowEventListener: di.inject(windowAddEventListenerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    matchedClusterId: di.inject(matchedClusterIdInjectable),
    isMac: di.inject(isMacInjectable),
    legacyOnChannelListen: di.inject(legacyOnChannelListenInjectable),
  }),
});
